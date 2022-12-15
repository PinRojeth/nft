import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import Web3Modal, { getProviderDescription } from "web3modal";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css"

export default function Home () {
  // WalletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState (false);
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState (false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState (false);
  // Check if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState (false);
  //tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMineted] = useState ("0");
  // Create a reference to the Web3 Modal (used for connecting to MetaMask) which persists as long as the page is open
  const [numTokenMinted, setNumTokenMinted] = useState(false);
  const web3ModalRef: any = useRef ();


  const getNumMintedToken = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract (NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);

      const numTokenIds = await nftContract.tokenIds();
      setNumTokenMinted(numTokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  }
  /*
    presaleMint: Mint an NFT during the presale
  */

    const presaleMint = async () => {
      try {
        // We need Signer here since this is a 'write' transaction.
        const signer: any = await getProviderOrSigner(true);
        // Create a new instance of the Contract with A Signer, which allows
        // update methods
        const nftContract = new Contract (NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
        // Call the presaleMint from the contract, only whitelisted addresses would be able to mint
        const tx = await nftContract.presaleMint ({
          // Value signifies the cost of one BBRCoin which is "0.01" eth.
          // We are parsing `0.01` string to ether using the utils library from ethers.js
          value: utils.parseEther("0.01"),
        });
        setLoading (true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        window.alert ("You successfully minted a Crypto Dev!");        
      } catch (err) {
        console.error (err);
      }
    };
    /*
      publicMint: Mint an NFT after the presale
    */
    const publicMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // create a new instance of the contract with a signer, which allows
      // update methods
      const nftContract = new Contract (NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      // Call the mint from the contract to mint the Crypto dev which is "0.01" eth.
      const tx = await nftContract.mint ({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther ("0.01"),
      });
      setLoading (true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert ("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error (err);
    }
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
    const connectWallet = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // When used for the first time, it prompts the user to connect their wallet
        await getProviderOrSigner();
        setWalletConnected(true);
      } catch (err) {
        console.error(err);
      }
    };

    /**
   * startPresale: starts the presale for the NFT Collection
   */
  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract (NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

      const tx = await nftContract.startPresale();
      setLoading(true);

      await tx.wait ();
      setLoading(false);

      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  }

    /*
      *CheckIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
      * Variable in the Contract
    */

      const checkIfPresaleStarted = async () => {
        try {
          // Get the provider from web3Modal, which in our case is MetaMask
          // No need for the signer here, as we are only reading state from the blockchain
          const provider = await getProviderOrSigner();
          // We connect to the contract using a provider, So we will only 
          // have read-only access to the Contract
          const nftContract = new Contract (NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider );
          // call the presaleEnded from the contract
          const _presaleStarted = await nftContract.presaleStarted();
          // Call the presaleStarted from the contract
          if (!_presaleStarted) {
            await getOwner();
          }
          setPresaleStarted(_presaleStarted);
          return _presaleStarted;
        } catch (err) {
          console.error (err);
          return false;
        } 
      };

      /**
      * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
      * variable in the contract
      */
     const checkIfPresaleEnded = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the Signer here, as we are only reading state from the blockchain
        const provider = await getProviderOrSigner();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
        // call the presaleEnded from the contract
        const _presaleEnded = await nftContract.presaleEnded();
        // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
        // Date.now()/1000 returns the current time in seconds
        // We compare if the _presaleEnded timestamp is less than the current time
        // which means presale has ended
        const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
        if (hasEnded) {
          setPresaleEnded(true);
        } else {
          setPresaleEnded(false);
        }
        return hasEnded;
      } catch (err) {
        console.error(err);
        return false;
      }
     };

      /*
        * getOwner: calls the contract to retrieve the owner 
      */
     const getOwner = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the singer here, as we are only reading state from the blockchain
        const provider = await getProviderOrSigner();
        // We Connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
        // call the owner function from the contract
        const _owner = await nftContract.owner();
        // we will get the signer now to extract the address of the currently connected MetaMask account
        const signer : providers.JsonRpcSigner = await getSigner ();
        // Get the address associated to the singer which is connected to MetaMask
        const address = await signer.getAddress();
        if(address.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
        }
      } catch (err : any) {
        console.error(err.message);
      }
     };

     const getSigner = async () => {
      // Connect to MetaMask
      // Since we store `Web3Modal` as a reference, we need to access the `current` value to get access to underlying object
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5 ) {
        window.alert("Change the network to Goerli");
        throw new Error ("Change network to Goerli");
      }

      const signer = web3Provider.getSigner();
      return signer;
     }

     /*
      * getTokenIdsMinted: gets the number of tokenIds that have been minted
     */
    const getTokenIdsMinted = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the Signer here, as we are only reading state from blockchain
        const provider = await getProviderOrSigner ();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
        // call the tokenIds from the contract
        const _tokenIds = await nftContract.tokenIds();
        // _tokenIds is a `Big Number`. We need to convert the Big number to a string
        setTokenIdsMineted(_tokenIds.toString());
      } catch (err) {
        console.error (err);
      }
    };

      /*
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

      const getProviderOrSigner = async (needSigner = false) => {
        // Connect to MetaMask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider (provider);

        // if user is not connected to the Goerli network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 5) {
          window.alert("Change the network to Goerli");
          throw new Error ("Change network to Goerli");
        }

        if (needSigner) {
          const signer = web3Provider.getSigner();
          return signer;
        }
        return web3Provider;
      };
      const onPageLoad = async () => {
        await connectWallet();
        await getOwner();
        const presaleStarted = await checkIfPresaleEnded();
        if (presaleStarted) {
          await checkIfPresaleEnded();
        }
        await getNumMintedToken();

        // Track in real time the number of minted NFTs
        setInterval( async() => {
          await getNumMintedToken();
        }, 5 * 1000);
        // Track in real time the status of presale (started, ended, whatever)
        setInterval(async() => {
          const presaleStarted = await checkIfPresaleStarted();
          if (presaleStarted) {
            await checkIfPresaleEnded();
          }
        }, 5 * 1000)
      };
      // useEffects are used to react to changes in state of the website
      // The array at the end of function call represents what state changes will trigger this effect
      // In this case, whenever the value of `walletConnected` changes - this effect will be called
      useEffect (() => {
        // if wallet is not connected, create a new instance of web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
          // Assign the web3Modal class to the reference object by setting it's `current` value
          // The `current` value is persisted throughout as long as this page is open
          web3ModalRef.current = new Web3Modal ({
            network: "goerli",
            providerOptions: {},
            disableInjectedProvider: false,
          });
          connectWallet();

          // Check if presale has started and ended
          const _presaleStarted : any =  checkIfPresaleStarted();
          if (_presaleStarted) {
            checkIfPresaleEnded();
          }

          getTokenIdsMinted();

          // Set an interval which gets called every 5 second to check presale has ended
          const presaleEndedInterval = setInterval(async function () {
            const _presaleStarted = await checkIfPresaleStarted();
            if (_presaleStarted) {
              const _presaleEnded = await checkIfPresaleEnded();
              if (_presaleEnded) {
                clearInterval (presaleEndedInterval);
              }
            }
          }, 5 * 1000);

          // set an interval to get the number of tokenIds minted every 5 seconds
          setInterval (async function () {
            await getTokenIdsMinted();
          }, 5 * 1000);
        }
      }, [walletConnected]);

    /*
      renderButton: Returns a button based on the state of the dapp
    */

    const renderButton = () => {
      // if wallet is not connected, return a button which allows them to connect their wallet
      if (!walletConnected) {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        );
      }

      // if we are currently waiting for something, return a loading button
      if (loading) {
        return <button className = {styles.button}> Loading...</button>;
      }

      // If connected user is the owner, and presale hasn't started yet, allow them to start the presale
      if (isOwner && !presaleStarted) {
        return (
          <button className={styles.button} onClick = {startPresale}>
            Start Presale!
          </button>
        );
      }

      // If connected user is not the owner but presale hasn't started yet, tell them that 
      if (!presaleStarted) {
        return (
          <div>
            <div className={styles.description}> Presale hasnt started!</div>
          </div>
        );
      }

      // if presale started, but hasn't ended yet, allow for minting during the presale period
      if (presaleStarted && !presaleEnded) {
        return (
          <div>
            <div className={styles.description}>
              Presale has started!!! If your address is whitelisted, Mint a Crypto Dev 🥳
            </div>
            <button className={styles.button} onClick= {presaleMint}>
            Presale Mint 🚀
            </button>
          </div>
        );
      }

      // If presale started and has ended, it's time for public minting
      if (presaleStarted && presaleEnded) {
        return (
          <button className={styles.button} onClick= {publicMint}>
            Presale Mint 🚀
          </button>
        );
      }
    };

    return (
      <div>
        <Head>
          <title> Crypto Devs </title>
          <meta name="description" content = "Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
          <div className={styles.main}>
          <div>
          <h1 className = {styles.title} >Welcome to KSK Crypto!!</h1> 
          <div className = {styles.description}>
          Its an NFT collection for developers in Crypto.
          </div>
          <div className= {styles.description}>
            {tokenIdsMinted}/20 have been minted!
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src ="cryptodevs/0.svg" />
        </div>
        </div>
        <footer className={styles.footer}>
        Made with &#169; by Rozet
        </footer>
      </div>
    );
}


