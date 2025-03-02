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
  const { isConnected } = useAccount();
  const [address, setAddress] = useState<string>('');
  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState<string>("top10"); // String olarak saklayın
  const [targetParticipant, setTargetParticipant] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // TEK BİR AUTH KONTROLÜ
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    
    // Session yüklenene kadar bekle
    if (status === 'loading') return;
    
    console.log('Home page auth check:', {
      session: !!session,
      status,
      isConnected,
      savedAddress: localStorage.getItem('walletAddress')
    });
    
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsWalletConnected(true);
      
      // Cookie'yi güncelle
      document.cookie = `walletAddress=${savedAddress}; path=/; max-age=86400`;
    }
    
    // Sadece session veya cüzdan yoksa yönlendir
    if (!session || (!isConnected && !savedAddress)) {
      console.log('Missing auth, redirecting to landing page');
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
    if (!session || !isConnected) {
      router.push('/')
    } else {
      const client = createPublicClient({
        chain: monad,
        transport: http()
      })

      client.readContract({
        address: MONAD_DEATHMATCH_ADDRESS,
        abi: MONAD_DEATHMATCH_ABI,
        functionName: 'MAX_PARTICIPANTS',
      }).then((result: bigint) => {
        setMaxParticipants(Number(result))
      }).catch((error) => {
        console.error('Error fetching MAX_PARTICIPANTS:', error)
      })
    }
  }, [session, isConnected, router])

  // Contract state hooks
  const { data: poolInfo } = useContractRead({
    address: MONAD_DEATHMATCH_ADDRESS,
    abi: MONAD_DEATHMATCH_ABI,
    functionName: 'getPoolInfo',
    args: [BigInt(1)],
    chainId: monadChain.id,
    watch: true,
  });

  const { data: participants } = useContractRead({
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
    if (!address || !participants) return false;
    return participants.some(
      (participant) => participant.toLowerCase() === address.toLowerCase()
    );
  }, [address, participants]);

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
  const handleJoin = useCallback(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isUserParticipant) { // isUserParticipant kullan
      toast.error('You have already joined this arena');
      return;
    }

    if (balance && balance.value < parseEther('1')) {
      toast.error('Insufficient balance for entry fee (1 MON)');
      return;
    }

    console.log('Joining pool...');
    
    try {
      joinPool?.();
    } catch (error) {
      console.error('Join error:', error);
      toast.error('Failed to join pool');
    }
  }, [isConnected, isUserParticipant, balance, joinPool]);

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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </span>
            ) : (
              <span className="text-red-500 ml-1 flex items-center">
                Inactive
                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
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
        if (!participants) {
          console.log("Katılımcı listesi henüz yüklenmedi.");
          return;
        }
        
        const enriched = participants.map(participant => {
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
      } catch (error) {
        console.error("Kullanıcı verilerini getirirken hata:", error);
      }
    };
    
    fetchTwitterData();
  }, [participants]);

  // Katılımcı listesini zenginleştirmek için geçici çözüm
  useEffect(() => {
    if (!participants || participants.length === 0) return;
    
    // Mock veriler oluştur
    const enriched = participants.map((participant, index) => {
      return {
        address: participant,
        twitterUsername: `user${index}`,
        profileImageUrl: null,
        isEliminated: false
      };
    });
    
    setEnrichedParticipants(enriched);
  }, [participants]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-5 pt-16"> {/* pt-16 ekledim - navbar için yer açmak üzere */}
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
            <div className="bg-[#1A1A1A] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Participants</h2>
              <div className="space-y-3">
                {participants && participants.length > 0 ? (
                  enrichedParticipants.map((participant, index) => (
                    <div 
                      key={participant.address} 
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors
                        ${participant.isEliminated 
                          ? 'bg-[#1A1A1A] opacity-50' 
                          : 'bg-[#222222] hover:bg-[#2a2a2a]'
                        }`}
                    >
                      {/* Kullanıcı bilgileri bölümü */}
                      <div className="flex items-center gap-4">
                        {/* Profil resmi */}
                        {participant.profileImageUrl ? (
                          <img 
                            src={participant.profileImageUrl} 
                            alt="X Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#333]"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-600 rounded-full border-2 border-[#333]" />
                        )}
                        
                        {/* Kullanıcı adı ve cüzdan adresi yan yana */}
                        <div className="flex items-center gap-2">
                          {participant.twitterUsername ? (
                            <span className="text-lg text-blue-400 font-medium">
                              @{participant.twitterUsername}
                            </span>
                          ) : (
                            <span className="text-lg text-gray-400 font-medium">
                              Anonymous
                            </span>
                          )}
                          
                          <span className="text-base text-gray-400">
                            {shortenAddress(participant.address)}
                          </span>
                          
                          {participant.address.toLowerCase() === address?.toLowerCase() && (
                            <span className="text-xs bg-[#8B5CF6] px-2 py-1 rounded text-white font-medium">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bahis kontrolleri */}
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          placeholder="0.1"
                          className="w-24 bg-[#333333] text-base px-3 py-2 rounded-md text-white focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                        />
                        
                        <select
                          value={betType}
                          onChange={(e) => setBetType(e.target.value)}
                          className="w-28 bg-[#333333] text-base px-3 py-2 rounded-md text-white focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                        >
                          <option value="top10">Top 10</option>
                          <option value="finalWinner">Final</option>
                        </select>
                        
                        <button
                          onClick={() => handleBet(participant.address)}
                          disabled={isBetting || !betAmount || Number(betAmount) < 0.1}
                          className="text-base px-6 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-md transition-all text-white font-medium disabled:bg-gray-600 disabled:opacity-50 min-w-[100px]"
                        >
                          {isBetting ? '...' : 'Bet'}
                        </button>
                      </div>
                      {participant.isEliminated && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                          Eliminated
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4 text-base">
                    No participants in the arena yet.
                  </div>
                )}
              </div>
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