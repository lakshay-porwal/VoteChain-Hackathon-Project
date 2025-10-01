import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Vote, Users, Trophy, Wallet, ChevronRight, CheckCircle, Clock, BarChart3, UserPlus, Plus, Shield, AlertCircle, Settings, Eye, User, RefreshCw, LogOut, Home, UserCheck, History, Bell, X, ExternalLink, Check } from 'lucide-react';
import {CONTRACT_ABI} from './utils/ABI'
const CONTRACT_ADDRESS = "0x28ad932A88701d31A5EFf0e8993E54624801eA77";
const ELECTION_COMMISSION_ADDRESS = "0x35EB19e991e53A40cfA350Fd6303E42048ad7D02";


// Storage utilities (in-memory storage for this environment)
const storage = {
  appState: null,
  
  setItem: (key, value) => {
    try {
      if (key === 'votechain_app_state') {
        storage.appState = value;
      }
    } catch (error) {
      console.warn('Storage not available, using memory:', error);
    }
  },
  
  getItem: (key) => {
    try {
      if (key === 'votechain_app_state') {
        return storage.appState;
      }
      return null;
    } catch (error) {
      console.warn('Storage not available:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      if (key === 'votechain_app_state') {
        storage.appState = null;
      }
    } catch (error) {
      console.warn('Storage not available:', error);
    }
  }
};

// Web3 utility functions
const getProvider = () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      return new window.ethers.providers.Web3Provider(window.ethereum);
    } catch (error) {
      console.error('Error creating provider:', error);
      return null;
    }
  }
  return null;
};

const getSigner = async () => {
  try {
    const provider = getProvider();
    if (!provider) return null;
    return await provider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
};

// ✅ Manual connect function (call this only when user clicks a button)
const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask not detected. Please install it.');
    return null;
  }

  try {
    // This will show the MetaMask popup and allow the user to choose account
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("Connected account:", accounts[0]);
    return accounts[0]; // You can store this in storage if you want
  } catch (error) {
    console.error("User rejected wallet connection:", error);
    return null;
  }
};

// Example usage in UI
// Call connectWallet() only when user clicks "Connect Wallet" button


const getContract = async (withSigner = false) => {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    if (withSigner) {
      const signer = await getSigner();
      if (!signer) return null;
      return new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    } else {
      return new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    }
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
};

// Router Context
const RouterContext = createContext();

const Router = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = storage.getItem('votechain_app_state');
    return saved?.currentPage || 'home';
  });
  
  const navigate = (page) => {
    setCurrentPage(page);
    // Save to storage
    const currentState = storage.getItem('votechain_app_state') || {};
    storage.setItem('votechain_app_state', { ...currentState, currentPage: page });
  };
  
  return (
    <RouterContext.Provider value={{ currentPage, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return context;
};

// Web3 Context
const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  // Core states
  const [account, setAccount] = useState('');
  const [availableAccounts, setAvailableAccounts] = useState([]); // Added available accounts state
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ethersLoaded, setEthersLoaded] = useState(false);
  const [chainId, setChainId] = useState('');
  
  // Contract data
  const [parties, setParties] = useState([]);
  const [voterData, setVoterData] = useState({ isRegistered: false, hasVoted: false, age: 0 });
  const [winnerData, setWinnerData] = useState({ name: '', votes: 0 });
  const [totalVotes, setTotalVotes] = useState(0);
  
  // UI states
  const [txLoading, setTxLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  // Transaction history
  const [transactions, setTransactions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Auto-refresh
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load initial state from storage
  useEffect(() => {
    const savedState = storage.getItem('votechain_app_state');
    if (savedState) {
      if (savedState.transactions) {
        setTransactions(savedState.transactions);
      }
      if (savedState.autoRefresh !== undefined) {
        setAutoRefresh(savedState.autoRefresh);
      }
    }
  }, []);

  // Save state to storage
  const saveStateToStorage = useCallback(() => {
    const state = {
      currentPage: storage.getItem('votechain_app_state')?.currentPage || 'home',
      transactions,
      autoRefresh,
      lastUpdate
    };
    storage.setItem('votechain_app_state', state);
  }, [transactions, autoRefresh, lastUpdate]);

  // Save state whenever it changes
  useEffect(() => {
    saveStateToStorage();
  }, [saveStateToStorage]);

  // Add notification
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, timestamp: new Date() };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  // Add transaction to history
  const addTransaction = useCallback((tx) => {
    setTransactions(prev => [tx, ...prev].slice(0, 50)); // Keep last 50 transactions
  }, []);

  // Load ethers.js
  useEffect(() => {
    const loadEthers = async () => {
      try {
        if (window.ethers) {
          setEthersLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
        script.onload = () => {
          console.log('Ethers.js loaded successfully');
          setEthersLoaded(true);
        };
        script.onerror = () => {
          console.error('Failed to load ethers.js');
          setError('Failed to load Web3 library');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading ethers:', error);
        setError('Error loading Web3 library');
      }
    };

    loadEthers();
  }, []);

 // Auto-reconnect on page load
useEffect(() => {
  const autoConnect = async () => {
    if (ethersLoaded && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const account = accounts[0];
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });

          setAccount(account);
          setChainId(chainId);
          setIsConnected(true);
          setIsAdmin(account.toLowerCase() === ELECTION_COMMISSION_ADDRESS.toLowerCase());

          const contractInstance = await getContract(true);
          setContract(contractInstance);

          await loadContractData(account);
          addNotification('Wallet reconnected successfully!', 'success');
        }
      } catch (error) {
        console.error('Error auto-connecting:', error);
        addNotification('Failed to auto-connect wallet', 'error');
      }
    }
  };

  autoConnect();
}, [ethersLoaded]); // ✅ removed addNotification from deps (prevents unnecessary reruns)

// Listen for account/network changes
useEffect(() => {
  if (typeof window.ethereum !== 'undefined') {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
        addNotification('Wallet disconnected', 'warning');
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        setIsAdmin(newAccount.toLowerCase() === ELECTION_COMMISSION_ADDRESS.toLowerCase());
        if (ethersLoaded) {
          loadContractData(newAccount);
          addNotification(
            `Switched to ${newAccount.substring(0, 6)}...${newAccount.slice(-4)}`,
            'info'
          );
        }
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(chainId);
      if (chainId !== '0xaa36a7') {
        addNotification('Please switch to Sepolia testnet', 'warning');
      } else {
        addNotification('Connected to Sepolia testnet', 'success');
        if (ethersLoaded && account) {
          loadContractData(account);
        }
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }
}, [ethersLoaded, account]); // ✅ removed addNotification from deps


  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh || !isConnected || !ethersLoaded) return;

    const interval = setInterval(() => {
      loadContractData(account, true);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, ethersLoaded, account]);

  // Connect wallet
  const connectWallet = async () => {
    if (!ethersLoaded) {
      addNotification('Please wait for Web3 library to load...', 'warning');
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        setError('');

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // Store all available accounts
        setAvailableAccounts(accounts);
        
        // Check/switch network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: { name: 'Sepolia ETH', symbol: 'SepoliaETH', decimals: 18 },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/']
                }]
              });
            } else {
              throw switchError;
            }
          }
        }
        
        setAccount(account);
        setChainId(chainId);
        setIsConnected(true);
        setIsAdmin(account.toLowerCase() === ELECTION_COMMISSION_ADDRESS.toLowerCase());
        
        const contractInstance = await getContract(true);
        setContract(contractInstance);
        
        await loadContractData(account);
        addNotification('Wallet connected successfully!', 'success');
        
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError('Error connecting wallet: ' + error.message);
        addNotification('Failed to connect wallet', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      addNotification('Please install MetaMask!', 'error');
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount('');
    setIsConnected(false);
    setIsAdmin(false);
    setContract(null);
    setParties([]);
    setVoterData({ isRegistered: false, hasVoted: false, age: 0 });
    setWinnerData({ name: '', votes: 0 });
    setTotalVotes(0);
    setTxStatus('');
    setError('');
  };

  // Load contract data
  const loadContractData = async (currentAccount = account, silent = false) => {
    if (!ethersLoaded) return;
    
    if (!silent) setLoading(true);
    setError('');
    
    try {
      const contractInstance = await getContract(false);
      if (!contractInstance) {
        throw new Error('Could not connect to contract');
      }

      // Get parties
      const numParties = await contractInstance.getNumberOfParties();
      const partiesData = [];
      let totalVoteCount = 0;

      for (let i = 0; i < numParties.toNumber(); i++) {
        try {
          const party = await contractInstance.politicalParties(i);
          const partyData = {
            id: i,
            name: party.name,
            totalVote: party.totalVote.toNumber()
          };
          partiesData.push(partyData);
          totalVoteCount += partyData.totalVote;
        } catch (error) {
          console.error(`Error fetching party ${i}:`, error);
        }
      }

      setParties(partiesData);
      setTotalVotes(totalVoteCount);

      // Get winner
      if (partiesData.length > 0) {
        try {
          const result = await contractInstance.watchResult();
          setWinnerData({
            name: result.winningPartyName,
            votes: result.winningVoteCount.toNumber()
          });
        } catch (error) {
          const winner = partiesData.reduce((max, party) => 
            party.totalVote > max.totalVote ? party : max
          );
          setWinnerData({ name: winner.name, votes: winner.totalVote });
        }
      }

      // Get voter status
      if (currentAccount) {
        try {
          const voter = await contractInstance.voters(currentAccount);
          setVoterData({
            isRegistered: voter.isRegistered,
            hasVoted: voter.hasVoted,
            age: voter.age.toNumber()
          });
        } catch (error) {
          console.error('Error fetching voter data:', error);
          setVoterData({ isRegistered: false, hasVoted: false, age: 0 });
        }
      }

      setLastUpdate(Date.now());
      
      if (!silent) {
        addNotification('Data refreshed successfully!', 'success', 2000);
      }

    } catch (error) {
      console.error('Error loading contract data:', error);
      setError('Error loading contract data: ' + error.message);
      if (!silent) {
        addNotification('Failed to load contract data', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Register party
  const registerParty = async (partyName) => {
    if (!partyName.trim()) {
      throw new Error('Please enter a party name');
    }
    
    setTxLoading(true);
    setTxStatus('Registering party...');
    setError('');
    
    const txData = {
      id: Date.now(),
      type: 'Register Party',
      status: 'pending',
      timestamp: new Date(),
      details: { partyName },
      hash: null
    };
    
    addTransaction(txData);
    
    try {
      const contractWithSigner = await getContract(true);
      if (!contractWithSigner) {
        throw new Error('Could not connect to contract');
      }

      const tx = await contractWithSigner.registerPoliticalParty(partyName);
      txData.hash = tx.hash;
      addTransaction({ ...txData, hash: tx.hash });
      
      setTxStatus('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTxStatus('Party registered successfully!');
        txData.status = 'success';
        addTransaction(txData);
        addNotification(`Party "${partyName}" registered successfully!`, 'success');
        
        await loadContractData();
        
        setTimeout(() => setTxStatus(''), 3000);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error registering party:', error);
      const errorMsg = error.reason || error.message || 'Transaction failed';
      setError('Error registering party: ' + errorMsg);
      setTxStatus('');
      
      txData.status = 'failed';
      txData.error = errorMsg;
      addTransaction(txData);
      addNotification('Failed to register party', 'error');
      
      throw error;
    } finally {
      setTxLoading(false);
    }
  };

  // Register voter
  const registerVoter = async (voterAddress, voterAge) => {
    if (!voterAddress.trim() || !voterAge) {
      throw new Error('Please fill in all voter details');
    }
    
    if (parseInt(voterAge) < 18) {
      throw new Error('Voter must be 18 or older');
    }

    if (!window.ethers.utils.isAddress(voterAddress)) {
      throw new Error('Please enter a valid Ethereum address');
    }
    
    setTxLoading(true);
    setTxStatus('Registering voter...');
    setError('');
    
    const txData = {
      id: Date.now(),
      type: 'Register Voter',
      status: 'pending',
      timestamp: new Date(),
      details: { voterAddress, age: voterAge },
      hash: null
    };
    
    addTransaction(txData);
    
    try {
      const contractWithSigner = await getContract(true);
      if (!contractWithSigner) {
        throw new Error('Could not connect to contract');
      }

      const tx = await contractWithSigner.registerVoter(voterAddress, parseInt(voterAge));
      txData.hash = tx.hash;
      addTransaction({ ...txData, hash: tx.hash });
      
      setTxStatus('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTxStatus('Voter registered successfully!');
        txData.status = 'success';
        addTransaction(txData);
        addNotification(`Voter registered successfully!`, 'success');
        
        setTimeout(() => setTxStatus(''), 3000);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error registering voter:', error);
      const errorMsg = error.reason || error.message || 'Transaction failed';
      setError('Error registering voter: ' + errorMsg);
      setTxStatus('');
      
      txData.status = 'failed';
      txData.error = errorMsg;
      addTransaction(txData);
      addNotification('Failed to register voter', 'error');
      
      throw error;
    } finally {
      setTxLoading(false);
    }
  };

  // Cast vote
  const castVote = async (partyIndex) => {
    if (!voterData.isRegistered) {
      throw new Error('You are not registered to vote');
    }
    
    if (voterData.hasVoted) {
      throw new Error('You have already voted');
    }
    
    setTxLoading(true);
    setTxStatus('Casting your vote...');
    setError('');
    
    const partyName = parties[partyIndex]?.name || `Party ${partyIndex}`;
    const txData = {
      id: Date.now(),
      type: 'Cast Vote',
      status: 'pending',
      timestamp: new Date(),
      details: { partyName, partyIndex },
      hash: null
    };
    
    addTransaction(txData);
    
    try {
      const contractWithSigner = await getContract(true);
      if (!contractWithSigner) {
        throw new Error('Could not connect to contract');
      }

      const tx = await contractWithSigner.voting(partyIndex);
      txData.hash = tx.hash;
      addTransaction({ ...txData, hash: tx.hash });
      
      setTxStatus('Vote submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTxStatus('Vote cast successfully!');
        txData.status = 'success';
        addTransaction(txData);
        addNotification(`Vote cast for ${partyName}!`, 'success');
        
        setVoterData({ ...voterData, hasVoted: true });
        await loadContractData();
        
        setTimeout(() => setTxStatus(''), 3000);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error casting vote:', error);
      const errorMsg = error.reason || error.message || 'Transaction failed';
      setError('Error casting vote: ' + errorMsg);
      setTxStatus('');
      
      txData.status = 'failed';
      txData.error = errorMsg;
      addTransaction(txData);
      addNotification('Failed to cast vote', 'error');
      
      throw error;
    } finally {
      setTxLoading(false);
    }
  };

  const value = {
    // State
    account,
    availableAccounts, // Add available accounts to context
    isConnected,
    isAdmin,
    contract,
    loading,
    ethersLoaded,
    chainId,
    parties,
    voterData,
    winnerData,
    totalVotes,
    txLoading,
    txStatus,
    error,
    notifications,
    transactions,
    showHistory,
    lastUpdate,
    autoRefresh,
    
    // Functions
    connectWallet,
    disconnect,
    loadContractData,
    registerParty,
    registerVoter,
    castVote,
    addNotification,
    setShowHistory,
    setAutoRefresh
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Notification Component
const NotificationCenter = () => {
  const { notifications, addNotification } = useWeb3();
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default: return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-400/30';
      case 'error': return 'bg-red-500/20 border-red-400/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-400/30';
      default: return 'bg-blue-500/20 border-blue-400/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`backdrop-blur-md rounded-lg p-4 border ${getNotificationBg(notification.type)} animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start space-x-3">
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{notification.message}</p>
              <p className="text-gray-300 text-xs mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => addNotification('', 'clear', 0)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Transaction History Component
const TransactionHistory = () => {
  const { transactions, showHistory, setShowHistory } = useWeb3();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'pending': return (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
      );
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 border-green-400/30';
      case 'failed': return 'bg-red-500/10 border-red-400/30';
      case 'pending': return 'bg-blue-500/10 border-blue-400/30';
      default: return 'bg-gray-500/10 border-gray-400/30';
    }
  };

  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <History className="h-6 w-6" />
            <span>Transaction History</span>
          </h3>
          <button
            onClick={() => setShowHistory(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96 p-6">
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-4 rounded-xl border ${getStatusBg(tx.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <h4 className="text-white font-medium">{tx.type}</h4>
                        <p className="text-sm text-gray-300 mt-1">
                          {tx.timestamp.toLocaleString()}
                        </p>
                        {tx.details && (
                          <div className="text-sm text-blue-200 mt-2">
                            {tx.type === 'Register Party' && tx.details.partyName && (
                              <p>Party: {tx.details.partyName}</p>
                            )}
                            {tx.type === 'Register Voter' && (
                              <div>
                                <p>Address: {tx.details.voterAddress?.substring(0, 10)}...</p>
                                <p>Age: {tx.details.age}</p>
                              </div>
                            )}
                            {tx.type === 'Cast Vote' && tx.details.partyName && (
                              <p>Voted for: {tx.details.partyName}</p>
                            )}
                          </div>
                        )}
                        {tx.error && (
                          <p className="text-red-300 text-sm mt-2">{tx.error}</p>
                        )}
                      </div>
                    </div>
                    {tx.hash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-white">No transactions yet</p>
              <p className="text-gray-300">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const { currentPage, navigate } = useRouter();
  const { 
    isAdmin, 
    account, 
    availableAccounts,
    disconnect, 
    transactions, 
    setShowHistory, 
    loadContractData,
    loading,
    lastUpdate,
    autoRefresh,
    setAutoRefresh,
    setAccount,
    setIsAdmin,
    addNotification,
    connectWallet,
    setContract,
    getContract
  } = useWeb3();

  const navItems = [
    { id: 'home', label: 'Election', icon: Home },
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin Panel', icon: Settings },
    ] : []),
    { id: 'results', label: 'Results', icon: Trophy },
  ];

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const switchAccount = async () => {
    try {
      setLoading(true);
      
      // If we already have multiple accounts, show them in a dropdown
      if (availableAccounts.length > 1) {
        // Show account selection UI
        // This will be handled in the Navigation component
      } else {
        // Method 1: Request new permissions (forces account selection)
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
          
          // After permission request, get updated accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAvailableAccounts(accounts);
          
          if (accounts && accounts.length > 0) {
            const newAccount = accounts[0];
            if (newAccount !== account) {
              // Account changed, update state
              setAccount(newAccount);
              setIsAdmin(newAccount.toLowerCase() === ELECTION_COMMISSION_ADDRESS.toLowerCase());
              await loadContractData(newAccount);
              addNotification(`Switched to ${formatAddress(newAccount)}`, 'success');
            } else {
              addNotification('Same account selected', 'info');
            }
          }
        } catch (permError) {
          console.log('Permission method failed, trying direct request...');
          
          // Method 2: Direct account request (may show account selector)
          try {
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            
            if (accounts && accounts.length > 0) {
              const newAccount = accounts[0];
              if (newAccount !== account) {
                // Account changed, update state
                setAccount(newAccount);
                setIsAdmin(newAccount.toLowerCase() === ELECTION_COMMISSION_ADDRESS.toLowerCase());
                await loadContractData(newAccount);
                addNotification(`Switched to ${formatAddress(newAccount)}`, 'success');
              } else {
                addNotification('Same account selected', 'info');
              }
            }
          } catch (requestError) {
            console.log('Direct request failed, trying disconnect/reconnect...');
            
            // Method 3: Guide user to manually switch in MetaMask
            addNotification('Please switch accounts manually in MetaMask, then click "Reconnect"', 'warning', 8000);
          }
        }
      }
    } catch (error) {
      console.error('Error switching account:', error);
      addNotification('Please switch accounts in MetaMask and refresh the page', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add a reconnect function for manual account switching
  const reconnectWallet = async () => {
    try {
      setLoading(true);
      
      // Get currently connected accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        const newAccount = accounts[0];
        
        if (newAccount !== account) {
          // Account has changed
          setAccount(newAccount);
          setIsAdmin(newAccount.toLowerCase() === ELECTION_COMMISSION_ADDRESS.toLowerCase());
          
          const contractInstance = await getContract(true);
          setContract(contractInstance);
          
          await loadContractData(newAccount);
          addNotification(`Connected to ${formatAddress(newAccount)}`, 'success');
        } else {
          addNotification('Same account reconnected', 'info');
        }
      } else {
        // No accounts connected, trigger connection
        await connectWallet();
      }
    } catch (error) {
      console.error('Error reconnecting:', error);
      addNotification('Error reconnecting wallet', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add force disconnect function
  const forceDisconnect = () => {
    disconnect();
    addNotification('Disconnected. Please switch accounts in MetaMask and reconnect.', 'info', 6000);
  };

  const pendingTxs = transactions.filter(tx => tx.status === 'pending').length;

  return (
    <header className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
              <Vote className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">VoteChain</h1>
              <p className="text-blue-200 text-sm">
                Decentralized Election System
                {lastUpdate && (
                  <span className="ml-2">
                    • Updated {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-blue-500/30 text-white border border-blue-400/50'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                  : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
              }`}
              title={`Auto-refresh is ${autoRefresh ? 'ON' : 'OFF'}`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              <span className="text-sm">Auto</span>
            </button>

            {/* Manual refresh */}
            <button
              onClick={() => loadContractData()}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Transaction history */}
            <button
              onClick={() => setShowHistory(true)}
              className="relative bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>History</span>
              {pendingTxs > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {pendingTxs}
                </span>
              )}
            </button>
            
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
              isAdmin 
                ? 'bg-yellow-500/20 border-yellow-400/30' 
                : 'bg-green-500/20 border-green-400/30'
            }`}>
              {isAdmin ? (
                <>
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-200 font-medium">Admin</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-green-400" />
                  <span className="text-green-200 font-medium">Voter</span>
                </>
              )}
            </div>
            
            <div className="relative group">
              <div className="flex items-center space-x-3 bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-400/30 cursor-pointer">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 font-medium">{formatAddress(account)}</span>
              </div>
              
              <div className="absolute right-0 top-full mt-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-48">
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-white/10">
                    Connected Account
                  </div>
                  
                  {availableAccounts.length > 1 ? (
                    <div className="max-h-48 overflow-y-auto">
                      {availableAccounts.map((acc, index) => (
                        <button
                          key={acc}
                          onClick={() => {
                            if (acc !== account) {
                              setAccount(acc);
                              setIsAdmin(acc.toLowerCase() === ELECTION_COMMISSION_ADDRESS.toLowerCase());
                              loadContractData(acc);
                              addNotification(`Switched to ${formatAddress(acc)}`, 'success');
                            }
                          }}
                          className={`w-full text-left px-4 py-2 ${
                            acc === account 
                              ? 'bg-blue-500/30 text-white' 
                              : 'text-white hover:bg-white/10'
                          } rounded-lg transition-colors flex items-center space-x-2`}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>{formatAddress(acc)}</span>
                          {acc === account && (
                            <Check className="w-4 h-4 ml-auto text-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={switchAccount}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Switch Account</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigator.clipboard.writeText(account)}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Copy Address</span>
                  </button>
                  <button
                    onClick={disconnect}
                    className="w-full text-left px-4 py-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex space-x-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-blue-500/30 text-white border border-blue-400/50'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

// Home Page Component
const HomePage = () => {
  const { 
    parties, 
    voterData, 
    winnerData, 
    totalVotes, 
    isAdmin, 
    loading, 
    castVote, 
    txLoading,
    loadContractData
  } = useWeb3();

  const getVotePercentage = (votes) => {
    return totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
  };

  const handleVote = async (partyId) => {
    try {
      await castVote(partyId);
    } catch (error) {
      // Error is handled in the Web3 context
    }
  };

  return (
    <div className="space-y-8">
      {/* Election Stats */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-white">2024 General Election</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-green-300" />
              <span className="text-green-200 font-medium">Voting Open</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{totalVotes.toLocaleString()}</p>
                <p className="text-blue-200">Total Votes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-lg font-bold text-white">{winnerData.name || 'TBD'}</p>
                <p className="text-blue-200">Leading Party</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{parties.length}</p>
                <p className="text-blue-200">Parties</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{winnerData.votes}</p>
                <p className="text-blue-200">Leading Votes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voter Status */}
      {!isAdmin && (
        <div className={`backdrop-blur-md rounded-2xl p-6 border ${
          voterData.isRegistered 
            ? voterData.hasVoted 
              ? 'bg-green-500/20 border-green-400/30'
              : 'bg-blue-500/20 border-blue-400/30'
            : 'bg-red-500/20 border-red-400/30'
        }`}>
          <div className="flex items-center space-x-3">
            {voterData.isRegistered ? (
              voterData.hasVoted ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Vote Submitted!</h3>
                    <p className="text-green-200">Thank you for participating in the election.</p>
                  </div>
                </>
              ) : (
                <>
                  <Vote className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Ready to Vote</h3>
                    <p className="text-blue-200">You are registered and eligible to vote. Age: {voterData.age}</p>
                  </div>
                </>
              )
            ) : (
              <>
                <AlertCircle className="h-8 w-8 text-red-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Not Registered</h3>
                  <p className="text-red-200">You need to be registered by the Election Commission to vote.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Candidates/Parties Grid */}
      {parties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parties.map((party) => (
            <div 
              key={party.id} 
              className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:border-white/40 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {party.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{party.name}</h3>
                    <p className="text-blue-200">Political Party</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{party.totalVote.toLocaleString()} votes</span>
                  <span className="text-blue-200">{getVotePercentage(party.totalVote)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(getVotePercentage(party.totalVote), 2)}%` }}
                  ></div>
                </div>
              </div>

              {!isAdmin && (
                <button
                  onClick={() => handleVote(party.id)}
                  disabled={!voterData.isRegistered || voterData.hasVoted || txLoading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    !voterData.isRegistered || voterData.hasVoted || txLoading
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105'
                  }`}
                >
                  {txLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Voting...</span>
                    </>
                  ) : voterData.hasVoted ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Voted</span>
                    </>
                  ) : (
                    <>
                      <Vote className="h-5 w-5" />
                      <span>Vote for {party.name}</span>
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-white mb-2">Loading Election Data...</h3>
              <p className="text-blue-200">Fetching parties from blockchain</p>
            </>
          ) : (
            <>
              <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Parties Registered</h3>
              <p className="text-blue-200">
                {isAdmin 
                  ? 'Use the administration panel to register political parties.'
                  : 'The Election Commission hasn\'t registered any parties yet.'
                }
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Admin Panel Component  
const AdminPanel = () => {
  const { registerParty, registerVoter, txLoading, parties, loadContractData } = useWeb3();
  const [newPartyName, setNewPartyName] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [voterAge, setVoterAge] = useState('');

  const handleRegisterParty = async (e) => {
    e.preventDefault();
    try {
      await registerParty(newPartyName);
      setNewPartyName('');
    } catch (error) {
      // Error handled in context
    }
  };

  const handleRegisterVoter = async (e) => {
    e.preventDefault();
    try {
      await registerVoter(voterAddress, voterAge);
      setVoterAddress('');
      setVoterAge('');
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <div className="space-y-8">
      <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Administration Panel</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Register Party */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Plus className="h-6 w-6 text-blue-400" />
              <span>Register Political Party</span>
            </h3>
            
            <form onSubmit={handleRegisterParty} className="space-y-4">
              <input
                type="text"
                placeholder="Enter party name"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              />
              
              <button
                type="submit"
                disabled={txLoading || !newPartyName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                {txLoading ? 'Processing...' : 'Register Party'}
              </button>
            </form>
          </div>
          
          {/* Register Voter */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <UserPlus className="h-6 w-6 text-green-400" />
              <span>Register Voter</span>
            </h3>
            
            <form onSubmit={handleRegisterVoter} className="space-y-4">
              <input
                type="text"
                placeholder="Voter wallet address (0x...)"
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              />
              
              <input
                type="number"
                placeholder="Age (must be 18+)"
                min="18"
                value={voterAge}
                onChange={(e) => setVoterAge(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              />
              
              <button
                type="submit"
                disabled={txLoading || !voterAddress.trim() || !voterAge}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                {txLoading ? 'Processing...' : 'Register Voter'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Current Parties */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Registered Parties ({parties.length})</h3>
        {parties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((party) => (
              <div key={party.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {party.id + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{party.name}</p>
                    <p className="text-blue-200 text-sm">{party.totalVote} votes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-200 text-center py-8">No parties registered yet</p>
        )}
      </div>
    </div>
  );
};

// Results Page Component
const ResultsPage = () => {
  const { parties, totalVotes, winnerData, loadContractData, loading } = useWeb3();

  const getVotePercentage = (votes) => {
    return totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
  };

  const sortedParties = [...parties].sort((a, b) => b.totalVote - a.totalVote);

  return (
    <div className="space-y-8">
      <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <span>Election Results</span>
          </h2>
        </div>

        {/* Winner Section */}
        {winnerData.name && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 mb-6 border border-yellow-400/30">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Current Leader</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-2">{winnerData.name}</p>
              <p className="text-yellow-200">{winnerData.votes} votes ({getVotePercentage(winnerData.votes)}%)</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Detailed Results</h3>
          {sortedParties.length > 0 ? (
            sortedParties.map((party, index) => (
              <div key={party.id} className={`p-6 rounded-xl border transition-all duration-200 hover:scale-105 ${
                index === 0 ? 'bg-yellow-500/20 border-yellow-400/50' :
                index === 1 ? 'bg-gray-500/20 border-gray-400/50' :
                index === 2 ? 'bg-amber-600/20 border-amber-500/50' :
                'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{party.name}</h4>
                      <p className="text-blue-200">Political Party</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{party.totalVote.toLocaleString()}</div>
                    <div className="text-blue-200">votes</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{getVotePercentage(party.totalVote)}%</div>
                    <div className="text-blue-200">of total</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all duration-1000 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700' :
                        'bg-gradient-to-r from-gray-500 to-gray-700'
                      }`}
                      style={{ width: `${Math.max(getVotePercentage(party.totalVote), 1)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-white">No voting results available</p>
              <p className="text-blue-200">Results will appear once voting begins</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {totalVotes > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all duration-200">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalVotes}</div>
              <div className="text-blue-200">Total Votes Cast</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all duration-200">
              <Vote className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{parties.length}</div>
              <div className="text-blue-200">Parties Competing</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all duration-200">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{getVotePercentage(winnerData.votes)}%</div>
              <div className="text-blue-200">Leading Percentage</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const AppContent = () => {
  const { currentPage } = useRouter();
  const { 
    isConnected, 
    ethersLoaded, 
    connectWallet, 
    loading, 
    error, 
    txStatus, 
    txLoading 
  } = useWeb3();

  // Loading screen while ethers loads
  if (!ethersLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/10 rounded-3xl p-12 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading Web3...</h2>
          <p className="text-blue-200">Initializing blockchain connection</p>
        </div>
      </div>
    );
  }

  // Wallet Connection Page
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl mb-8 mx-auto w-fit">
              <Vote className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">VoteChain</h1>
            <p className="text-blue-200 mb-8 text-lg">Secure, transparent, decentralized voting powered by blockchain technology.</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-6 w-6" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
            
            <div className="mt-6 space-y-2">
              <p className="text-blue-300 text-sm">Make sure you're connected to Sepolia testnet</p>
              <p className="text-blue-400 text-xs">Your session will be restored when you return</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <Navigation />
        <NotificationCenter />
        <TransactionHistory />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Messages */}
          {error && (
            <div className="mb-6">
              <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                  <span className="text-white font-medium">{error}</span>
                </div>
              </div>
            </div>
          )}

          {txStatus && (
            <div className="mb-6">
              <div className="backdrop-blur-md bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  {txLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent flex-shrink-0"></div>
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  )}
                  <span className="text-white font-medium">{txStatus}</span>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'admin' && <AdminPanel />}
          {currentPage === 'results' && <ResultsPage />}
          
          {/* Contract Info Footer */}
          <div className="mt-12 text-center">
            <div className="backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">Contract Address</p>
                  <p className="text-white font-mono break-all">{CONTRACT_ADDRESS}</p>
                </div>
                <div>
                  <p className="text-blue-200">Network</p>
                  <p className="text-white">Sepolia Testnet</p>
                </div>
                <div>
                  <p className="text-blue-200">Election Commission</p>
                  <p className="text-white font-mono break-all">{ELECTION_COMMISSION_ADDRESS}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App with Providers
const ElectionDApp = () => {
  return (
    <Router>
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    </Router>
  );
};

export default ElectionDApp;