'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { FC } from 'react'; // Tip import'u ekledik
import { ethers } from 'ethers'; 
import { 
  useContractRead,
  useContractWrite,
  useAccount,
  useBalance,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MONAD_DEATHMATCH_ADDRESS, MONAD_DEATHMATCH_ABI } from '@/config/contracts';
import { monadChain } from '@/app/wagmi';
import { toast } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { shortenAddress } from '@/utils/address';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EliminatedPlayers from '@/components/EliminatedPlayers';
import EliminationTimer from '@/components/EliminationTimer';
import { createPublicClient, http } from 'viem'
import { monad } from '@/config/chains'
import { supabase } from '@/lib/supabase';

// Tip tanımlamalarını dosyanın başına taşıyalım
interface Bet {
  participant: string
  amount: bigint
  isActive: boolean
  timestamp: number
  poolId?: bigint
  transactionHash?: string
}

interface BetItemProps {
  bet: Bet
  index: number
}

// User interface'ini ekleyelim
interface User {
  id: string;
  walletAddress: string;
  twitterUsername?: string | null;
  profileImageUrl?: string | null;
}

interface Participant {
  id: string;
  wallet_address: string;
  twitter_username: string;
  twitter_profile_image: string;
  is_active: boolean;
  joined_at: string;
}

// 1. localStorage kullanarak bahisleri takip etmek için bir utils fonksiyonu oluşturun
// Bu fonksiyon src/utils/bets.ts olarak kaydedilebilir
const saveBetTypeToLocalStorage = (participant: string, betType: string) => {
  try {
    // Mevcut bahisleri al
    const storedBets = localStorage.getItem('userBets');
    const bets = storedBets ? JSON.parse(storedBets) : {};
    
    // Bu katılımcı için bahis tipini kaydet
    bets[participant.toLowerCase()] = betType;
    
    // Güncellenmiş bahisleri kaydet
    localStorage.setItem('userBets', JSON.stringify(bets));
  } catch (error) {
    console.error('Failed to save bet type:', error);
  }
};

const getBetTypeFromLocalStorage = (participant: string) => {
  try {
    const storedBets = localStorage.getItem('userBets');
    if (!storedBets) return '-';
    
    const bets = JSON.parse(storedBets);
    return bets[participant.toLowerCase()] || '-';
  } catch (error) {
    console.error('Failed to get bet type:', error);
    return '-';
  }
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { address: wagmiAddress, isConnected } = useAccount(); // Wagmi hookunu ekleyin
  const [address, setAddress] = useState<string>('');
  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState<string>("top10"); // String olarak saklayın
  const [targetParticipant, setTargetParticipant] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const hasRedirected = useRef(false);
  const hasAttemptedRedirect = useRef(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // TEK BİR AUTH KONTROLÜ
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    
    // Session yüklenene kadar bekle
    if (status === 'loading') return;
    if (hasRedirected.current) return;
    
    console.log('HOME PAGE AUTH CHECK:', {
      session: !!session,
      status,
      address,
      savedAddress: localStorage.getItem('walletAddress'),
      cookies: document.cookie
    });
    
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsWalletConnected(true);
      
      // Cookie'yi güncelle
      document.cookie = `walletAddress=${savedAddress}; path=/; max-age=86400; SameSite=Lax`;
    }
    
    // Sadece session veya cüzdan yoksa yönlendir
    if (!session || (!isConnected && !savedAddress)) {
      console.log('Missing auth, redirecting to landing page');
      hasRedirected.current = true;
      router.replace('/');
    }
  }, [mounted, session, status, isConnected, router]);
  
  // DİĞER useEffect'lerdeki REDIRECT KODLARINI KALDIRIN
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // LocalStorage'den bahis verilerini yükle
      const storedBets = localStorage.getItem('userBets');
      console.log('Stored bet types:', storedBets ? JSON.parse(storedBets) : {});
      setIsMounted(true);
    }
  }, []);

  // Add this effect to link Twitter and wallet if both are connected
  useEffect(() => {
    const linkTwitterWithWallet = async () => {
      if (session?.user && isWalletConnected && address) {
        try {
          await fetch('/api/user/connect-twitter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: address,
              twitterId: session.user.id
            })
          });
        } catch (error) {
          console.error('Error linking accounts:', error);
        }
      }
    };

    linkTwitterWithWallet();
  }, [session, address, isWalletConnected]);

  useEffect(() => {
    const connectTwitterWithWallet = async () => {
      if (session?.user && address) {
        console.log("Bağlantı deneniyor:", { 
          twitter: session.user, 
          wallet: address 
        });
        
        try {
          const response = await fetch('/api/user/connect-twitter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: address,
            }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            console.log("Twitter hesabı cüzdan ile ilişkilendirildi:", data);
          } else {
            console.error("Bağlantı hatası:", data);
            // BAŞARISIZ MESAJI GÖSTER
          }
        } catch (error) {
          console.error("Twitter hesabını bağlarken hata:", error);
          // BAŞARISIZ MESAJI GÖSTER
        }
      }
    };
    
    connectTwitterWithWallet();
  }, [session, address]);

  useEffect(() => {
    if (!session || !isWalletConnected) {
      return; // Sadece erken çıkış, yönlendirme yok!
    }
    
    // Diğer işlemleri yap...
    const client = createPublicClient({
      chain: monad,
      transport: http()
    });

    client.readContract({
      address: MONAD_DEATHMATCH_ADDRESS,
      abi: MONAD_DEATHMATCH_ABI,
      functionName: 'MAX_PARTICIPANTS',
    }).then((result: bigint) => {
      setMaxParticipants(Number(result))
    }).catch((error) => {
      console.error('Error fetching MAX_PARTICIPANTS:', error)
    })
  }, [session, isWalletConnected])

  // Contract state hooks
  const { data: poolInfo } = useContractRead({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'getPoolInfo',
    args: [BigInt(1)],
    chainId: monadChain.id,
    watch: true,
  });

  const { data: participantsData } = useContractRead({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'getParticipants',
    args: [BigInt(1)],
    chainId: monadChain.id,
    watch: true,
  });

  const { data: balance } = useBalance({
    address: address as `0x${string}`,
    chainId: monadChain.id,
  });

  // DÜZELTME 1: Kullanıcının katılım durumunu participants listesi üzerinden manuel kontrol edelim
  const isUserParticipant = useMemo(() => {
    if (!address || !participantsData) return false;
    return participantsData.some(
      (participant) => participant.toLowerCase() === address.toLowerCase()
    );
  }, [address, participantsData]);

  // Kullanıcının aktif bahisleri
  const { data: userBets } = useContractRead({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'getBettingHistory',
    args: [BigInt(1), address as `0x${string}`],
    enabled: !!address,
    chainId: monadChain.id,
    watch: true,
  });

  // Pool stats - totalPoolBets fonksiyonuyla toplam bahis miktarını alıyoruz
  const { data: totalBetAmount } = useContractRead({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'totalPoolBets',
    args: [BigInt(1)],
    chainId: monadChain.id,
    watch: true,
  });

  // Optional pool joining
  const { config: joinConfig } = usePrepareContractWrite({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'joinPool',
    args: [BigInt(1)],
    value: parseEther('1'),
    enabled: isConnected && !isUserParticipant, // isUserParticipant kullan
  });

  const { write: joinPool, isLoading: isJoining, data: joinTx } = useContractWrite(joinConfig);

  // Transaction handling for joining
  useWaitForTransaction({
    hash: joinTx?.hash,
    onSuccess: () => {
      toast.success('Successfully joined the arena!');
    },
    onError: (error) => {
      toast.error('Failed to join arena: ' + error.message);
    },
  });

  // DÜZELTME 2: Bet işlemi için yapılandırmayı güncelliyoruz
  const { config: betConfig } = usePrepareContractWrite({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'placeBet',
    args: [
      BigInt(1),
      targetParticipant as `0x${string}`,
      betType // string olarak direkt betType değerini gönder
    ],
    value: betAmount ? parseEther(betAmount) : BigInt(0),
    enabled: Boolean(targetParticipant && betAmount && Number(betAmount) >= 0.1),
  });

  const { write: placeBet, isLoading: isBetting, data: betTx } = useContractWrite(betConfig);

  // Transaction handling for betting
  useWaitForTransaction({
    hash: betTx?.hash,
    onSuccess: () => {
      toast.success('Bet placed successfully!');
      setBetAmount('');
      setTargetParticipant(null);
    },
    onError: (error) => {
      toast.error('Failed to place bet: ' + error.message);
    },
  });

  // DÜZELTME 3: handleBet fonksiyonunu düzeltiyoruz
  const handleBet = useCallback((participant: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!betAmount || Number(betAmount) < 0.1) {
      toast.error('Minimum bet is 0.1 MON');
      return;
    }

    console.log('Placing bet:');
    console.log('- Pool ID: 1');
    console.log('- Participant:', participant);
    console.log('- Bet Type:', betType); // Tam olarak kontratın beklediği değeri kullan
    console.log('- Amount:', betAmount, 'MON');
    
    // Katılımcı ve bahis tipini localStorage'e kaydet
    saveBetTypeToLocalStorage(participant, betType === 'top10' ? 'Top 10' : 'Final Winner');
    
    // Önce hedefi ayarla
    setTargetParticipant(participant);
    
    // Ardından timeout ile bahis işlemini çalıştır (state güncellemesinin tamamlanması için)
    setTimeout(() => {
      try {
        placeBet?.();
      } catch (error) {
        console.error('Bet error:', error);
        toast.error('Failed to place bet');
      }
    }, 100);
  }, [isConnected, betAmount, betType, placeBet]);

  // handleJoin fonksiyonu
  const handleJoin = useCallback(async () => {
    if (!isConnected) {
      toast.error('Lütfen önce cüzdanınızı bağlayın');
      return;
    }
  
    try {
      // Smart contract işlemi
      await joinPool?.();
      
      // Başarılı olursa Supabase'i güncelle
      const { error } = await supabase
        .from('participants')
        .update({ joined_pool: true })
        .eq('wallet_address', wagmiAddress);
  
      if (error) throw error;
      
      toast.success('Havuza başarıyla katıldınız!');
    } catch (error) {
      console.error('Havuza katılırken hata:', error);
      toast.error('Havuza katılırken bir hata oluştu');
    }
  }, [isConnected, joinPool, wagmiAddress]);

  // Calculated values - totalPrize hesaplamasını güncelliyoruz
  const totalPrize = useMemo(() => {
    if (!poolInfo) return '0';
    
    // Her katılımcı 1 MON ödediği için toplam ödül = katılımcı sayısı * 1 MON
    const totalParticipants = poolInfo.totalParticipants || BigInt(0);
    const totalEntryFees = totalParticipants * parseEther('1');
    
    // Kontrat tarafından hesaplanan ödüllerin toplamı
    const contractRewards = 
      (poolInfo.luckyWinner1Reward || BigInt(0)) + 
      (poolInfo.luckyWinner2Reward || BigInt(0)) + 
      (poolInfo.luckyWinner3Reward || BigInt(0));
    
    // Eğer kontrat ödülleri tanımlanmışsa onları kullan, yoksa giriş ücretleri toplamını göster
    const finalPrize = contractRewards > 0 ? contractRewards : totalEntryFees;
    
    return formatEther(finalPrize);
  }, [poolInfo]);

  // Total bet pool calculation
  const formattedTotalBetAmount = useMemo(() => {
    if (!totalBetAmount) return '0';
    return formatEther(totalBetAmount);
  }, [totalBetAmount]);

  // 1. Bu useEffect'i ekleyerek bahis tiplerini zenginleştirelim
  const [enrichedUserBets, setEnrichedUserBets] = useState<any[]>([]);

  // Kullanıcının top10 bahisleri
  const { data: userTop10Bets } = useContractRead({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'top10Bets',
    args: [BigInt(1), address as `0x${string}`],
    enabled: !!address,
    chainId: monadChain.id,
    watch: true,
  });

  // Kullanıcının finalWinner bahisleri
  const { data: userFinalWinnerBets } = useContractRead({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'finalWinnerBets',
    args: [BigInt(1), address as `0x${string}`],
    enabled: !!address,
    chainId: monadChain.id,
    watch: true,
  });

  // Bahis verilerini zenginleştir - basitleştirilmiş versiyon
  useEffect(() => {
    if (!userBets || userBets.length === 0) {
      setEnrichedUserBets([]);
      return;
    }
    
    // localStorage'den bahis tiplerini alarak bahisleri zenginleştir
    const enriched = userBets.map(bet => {
      // Her katılımcı için localStorage'den bahis tipini alın
      const betTypeName = getBetTypeFromLocalStorage(bet.participant);
      
      return {
        ...bet,
        betTypeName
      };
    });
    
    setEnrichedUserBets(enriched);
    
  }, [userBets]);

  // Bahis türlerini doğru göstermek için bu bileşeni ekleyelim
  const BetItem: FC<BetItemProps> = ({ bet, index }) => {
    return (
      <div className="bg-[#222222] p-2 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-white">{shortenAddress(bet.participant)}</span>
          <span className="text-[#8B5CF6]">{formatEther(bet.amount)} MON</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400 flex items-center">
            Status: 
            {bet.isActive ? (
              <span className="text-[#8B5CF6] ml-1 flex items-center">
                Active
                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 000 16zm3.707-9.293a1 1 000-1.414-1.414L9 10.586 7.707 9.293a1 1 00-1.414 1.414l2 2a1 1 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </span>
            ) : (
              <span className="text-red-500 ml-1 flex items-center">
                Inactive
                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 000-16 8 8 000 16zM8.707 7.293a1 1 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 001.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
              </span>
            )}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(Number(bet.timestamp) * 1000).toLocaleDateString()}
          </span>
        </div>
        
        <div className="mt-1 pt-1 border-t border-gray-800">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">
              Pool ID: {bet.poolId ? Number(bet.poolId) : 1}
            </span>
            <span className="text-xs text-gray-500">
              TX: {bet.transactionHash ? shortenAddress(bet.transactionHash) : "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Mevcut katılımcı listesi bölümünü güncelleyin
  const [enrichedParticipants, setEnrichedParticipants] = useState<any[]>([]);

  // Twitter/X kullanıcı verilerini almak için useEffect ekleyin
  useEffect(() => {
    const fetchTwitterData = async () => {
      try {
        const response = await fetch('/api/user/get-users');
        const users: User[] = await response.json();
        
        // participants'in tanımlı olup olmadığını kontrol et
        if (!participantsData) {
          console.log("Katılımcı listesi henüz yüklenmedi.");
          return;
        }
        
        const enriched = participantsData.map(participant => {
          const userMatch = users.find(
            (user: User) => user.walletAddress.toLowerCase() === participant.toLowerCase()
          );
          
          return {
            address: participant,
            twitterUsername: userMatch?.twitterUsername || null,
            profileImageUrl: userMatch?.profileImageUrl || null
          };
        });
        
        setEnrichedParticipants(enriched);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setLoading(false);
      }
    };
    
    fetchTwitterData();
  }, [participantsData]);

  // Katılımcı listesini zenginleştirmek için geçici çözüm
  useEffect(() => {
    if (!participantsData || participantsData.length === 0) return;
    
    // Mock veriler oluştur
    const enriched = participantsData.map((participant, index) => {
      return {
        address: participant,
        twitterUsername: `user${index}`,
        profileImageUrl: null,
        isEliminated: false
      };
    });
    
    setEnrichedParticipants(enriched);
  }, [participantsData]);

  // Eğer cüzdan bağlı değilse ana sayfaya yönlendir
  useEffect(() => {
    if (!isConnected && mounted) {
      router.replace('/');
    }
  }, [isConnected, mounted, router]);

  // Auth kontrolü
  useEffect(() => {
    // Erken çıkış durumları
    if (status === 'loading') return;
    if (hasAttemptedRedirect.current) return;
    
    console.log('Home Page Auth Check:', {
      session: !!session,
      isConnected,
      hasAttempted: hasAttemptedRedirect.current
    });

    // Hesaplardan biri eksikse yönlendir
    if (!session || !isConnected) {
      hasAttemptedRedirect.current = true;
      console.log('Missing auth, redirecting to landing page...');
      router.replace('/');
    }
  }, [session, status, isConnected, router]);

  // Yükleme durumu
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // Auth eksikse içeriği gösterme
  if (!session || !isConnected) {
    return null;
  }

  if (!mounted || !isConnected) return null;

  if (!isMounted) {
    return null;
  }

  useEffect(() => {
    async function fetchParticipants() {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('is_active', true)
          .order('joined_at', { ascending: false });

        if (error) throw error;

        // Smart contract'taki adreslerle eşleştir
        const activeParticipants = data?.filter(participant => 
          participantsData?.includes(participant.wallet_address)
        );

        setParticipants(activeParticipants || []);
      } catch (error) {
        console.error('Error loading participants:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, [participantsData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-white">Katılımcılar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0D0D0D]">
      {/* Banner Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/banner.png"
          alt="Monad Deathmatch Banner"
          fill
          priority
          quality={100}
          className="banner-image"
        />
        <div className="banner-overlay" />
      </div>

      {/* Ana İçerik */}
      <div className="relative z-20 container mx-auto px-4 pt-20">
        <Navbar />
        <main className="container mx-auto p-5 max-w-[1280px]"> {/* pt-6 ve lg:pt-10 değerlerini kaldırdık çünkü pt-16 yeterli */}
          {/* Ana Grid Yapısı */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Sol Panel - 3 kolon */}
            <div className="lg:col-span-3 space-y-5">
              {/* Banner */}
              <div className="relative h-32 rounded-xl overflow-hidden">
                <Image
                  src="/Untitled (Outdoor Banner (72 in x 36 in)) (1).png"
                  alt="Monad Deathmatch Arena Banner"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80">
                  <div className="p-4 flex items-end h-full">
                    <div className="flex-1">
                      <h1 className="text-xl font-bold text-white">Monad Deathmatch</h1>
                      <p className="text-xs text-gray-300">Survival of the fittest</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-300">Players</p>
                      <p className="text-lg font-bold text-white">
                        {Number(poolInfo?.totalParticipants || 0)}/{maxParticipants?.toString() || '100'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pool Info */}
              <div className="bg-[#1A1A1A] p-4 rounded-xl">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Phase</p>
                    <p className="text-sm font-medium text-white">
                      {poolInfo?.phase ? Number(poolInfo.phase) : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Prize Pool</p>
                    <p className="text-sm font-medium text-[#8B5CF6]">
                      {totalPrize} MON
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Total Bets</p>
                    <p className="text-sm font-medium text-white">
                      {formattedTotalBetAmount} MON
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className={`text-sm font-medium ${
                      poolInfo?.active ? 'text-[#8B5CF6]' : 'text-red-500'
                    }`}>
                      {poolInfo?.active ? 'Active' : 'Ended'}
                    </p>
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={isJoining || isUserParticipant}
                    className="col-span-2 md:col-span-1 h-10 bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs rounded-lg font-medium text-white disabled:opacity-50 disabled:bg-gray-600"
                  >
                    {isJoining ? 'Joining...' : isUserParticipant ? 'Joined ✓' : 'Join 1 MON'}
                  </button>
                </div>
              </div>

              {/* Participants List */}
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#262626]">
                <h2 className="text-2xl font-semibold mb-4">
                  Participants ({participants.length})
                </h2>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B5CF6] border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((user) => (
                      <div 
                        key={user.id}
                        className="bg-[#262626] p-4 rounded-lg flex items-center gap-4 hover:bg-[#333333] transition-colors"
                      >
                        {/* Profile Image */}
                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                          <Image
                            src={user.twitter_profile_image || '/default-avatar.png'}
                            alt={user.twitter_username || 'User'}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          {user.twitter_username && (
                            <a
                              href={`https://twitter.com/${user.twitter_username.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#8B5CF6] hover:underline font-medium"
                            >
                              {user.twitter_username}
                            </a>
                          )}
                          <div className="text-sm text-gray-400 font-mono">
                            {user.wallet_address.slice(0, 6)}...
                            {user.wallet_address.slice(-4)}
                          </div>
                        </div>

                        {/* Join Date */}
                        <div className="text-xs text-gray-500">
                          {new Date(user.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Sidebar - 1 kolon */}
            <div className="lg:col-span-1 space-y-5">
              {/* Elimination Timer */}
              <EliminationTimer />
              
              {/* Eliminated Players */}
              <EliminatedPlayers />
              
              {/* My Stats */}
              <div className="bg-[#1A1A1A] p-4 rounded-xl">
                <h2 className="text-sm font-semibold text-white mb-2">My Stats</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Status:</span>
                    <span className={isUserParticipant ? 'text-[#8B5CF6]' : 'text-yellow-500'}>
                      {isUserParticipant ? 'Participant' : 'Not Joined'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Balance:</span>
                    <span className="text-white">
                      {balance ? formatEther(balance.value) : '0'} MON
                    </span>
                  </div>
                </div>
              </div>

              {/* My Bets */}
              <div className="bg-[#1A1A1A] p-4 rounded-xl">
                <h2 className="text-sm font-semibold text-white mb-2">My Bets</h2>
                <div className="space-y-2">
                  {userBets && userBets.length > 0 ? userBets.map((bet, index) => (
                    <div key={index} className="p-2 bg-[#222222] rounded-lg">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white">{shortenAddress(bet.participant)}</span>
                        <span className="text-[#8B5CF6]">{formatEther(bet.amount)} MON</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[10px] text-gray-400">
                        <span>{bet.isActive ? 'Active' : 'Closed'}</span>
                        <span>{new Date(Number(bet.timestamp) * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-gray-500 py-2 text-xs">
                      No active bets
                    </div>
                  )}
                </div>
              </div>

              {/* Game Rules */}
              <div className="bg-[#1A1A1A] p-4 rounded-xl">
                <h2 className="text-sm font-semibold text-white mb-2">Game Rules</h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[#222222] rounded">
                    <p className="text-gray-400">Entry Fee</p>
                    <p className="text-white">1 MON</p>
                  </div>
                  <div className="p-2 bg-[#222222] rounded">
                    <p className="text-gray-400">Min Bet</p>
                    <p className="text-white">0.1 MON</p>
                  </div>
                  <div className="p-2 bg-[#222222] rounded">
                    <p className="text-gray-400">Max Bet</p>
                    <p className="text-white">10 MON</p>
                  </div>
                  <div className="p-2 bg-[#222222] rounded">
                    <p className="text-gray-400">Daily Elim.</p>
                    <p className="text-white">3 Players</p>
                  </div>
                </div>
              </div>
              
              {/* Prize Distribution */}
              <div className="bg-[#1A1A1A] p-4 rounded-xl">
                <h2 className="text-sm font-semibold text-white mb-2">Prize Distribution</h2>
                <div className="space-y-2">
                  <div className="p-2 bg-[#222222] rounded text-xs">
                    <p className="text-gray-400 mb-1">Pool Winners</p>
                    <div className="grid grid-cols-3 gap-1">
                      <div><span className="text-white">Lucky 1:</span> <span className="text-[#8B5CF6]">15%</span></div>
                      <div><span className="text-white">Lucky 2:</span> <span className="text-[#8B5CF6]">15%</span></div>
                      <div><span className="text-white">Lucky 3:</span> <span className="text-[#8B5CF6]">50%</span></div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#222222] rounded text-xs">
                    <p className="text-gray-400 mb-1">Bet Rewards</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div><span className="text-white">Top 10:</span> <span className="text-[#8B5CF6]">25%</span></div>
                      <div><span className="text-white">Final:</span> <span className="text-[#8B5CF6]">50%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <iframe 
          id="verify-api" 
          src="https://verify.walletconnect.org/71c7dda23b92549b898f265e76af1221"
          title="WalletConnect Verification"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

// Katılımcı tipi için interface ekleyin
interface ParticipantProps {
  participants: string[];
}

// Katılımcıları görüntüleme bileşeni - tip eklenmiş hali
function Participants({ participants }: ParticipantProps) {
  // Zenginleştirilmiş katılımcı tipi
  interface EnrichedParticipant {
    walletAddress: string;
    twitterUsername: string | null;
    profileImageUrl: string | null;
  }

  const [enrichedParticipants, setEnrichedParticipants] = useState<EnrichedParticipant[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/get-users');
        const users: User[] = await response.json(); // Tip ekledik
        console.log("Tüm kullanıcılar:", users);
        
        // Cüzdan adresleri için profil bilgilerini eşleştirin
        const enriched = participants.map(address => {
          const userMatch = users.find(
            (user: User) => user.walletAddress.toLowerCase() === address.toLowerCase() // Tip ekledik
          );
          
          return {
            walletAddress: address,
            twitterUsername: userMatch?.twitterUsername || null,
            profileImageUrl: userMatch?.profileImageUrl || null
          };
        });
        
        console.log("Zenginleştirilmiş katılımcılar:", enriched);
        setEnrichedParticipants(enriched);
      } catch (error) {
        console.error("Kullanıcı verilerini getirirken hata:", error);
      }
    };
    
    if (participants.length > 0) {
      fetchUserData();
    }
  }, [participants]);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Participants ({participants.length})</h2>
      <ul className="space-y-2">
        {enrichedParticipants.map((participant, i) => (
          <li key={i} className="flex items-center p-2 bg-gray-800 rounded-lg">
            {participant.profileImageUrl ? (
              <img 
                src={participant.profileImageUrl} 
                alt="Profile" 
                className="w-10 h-10 rounded-full mr-3" 
              />
            ) : (
              <div className="w-10 h-10 bg-gray-600 rounded-full mr-3" />
            )}
            
            <div>
              {participant.twitterUsername && (
                <p className="text-blue-400">@{participant.twitterUsername}</p>
              )}
              <p className="text-gray-300">
                {participant.walletAddress.slice(0, 6)}...{participant.walletAddress.slice(-4)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

useEffect(() => {
  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('joined_pool', true) // Sadece havuza katılanları getir
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setParticipants(data || []);
      console.log('Katılımcılar yüklendi:', data);
    } catch (error) {
      console.error('Katılımcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchParticipants();

  // Gerçek zamanlı güncellemeler için subscription
  const subscription = supabase
    .channel('participants-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'participants' },
      () => fetchParticipants()
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);

const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

if (loading) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-white">Katılımcılar yükleniyor...</div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#0D0D0D] py-12">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-white mb-8">Aktif Katılımcılar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participants.map((participant) => (
          <div 
            key={participant.wallet_address}
            className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626] hover:border-[#8B5CF6] transition-all"
          >
            <div className="flex items-center space-x-4">
              <img 
                src={participant.twitter_profile_image}
                alt={participant.twitter_username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-white font-medium">
                  @{participant.twitter_username}
                </p>
                <p className="text-gray-400 text-sm">
                  {shortenAddress(participant.wallet_address)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {participants.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          Henüz havuzda katılımcı bulunmuyor.
        </div>
      )}
    </div>
  </div>
);