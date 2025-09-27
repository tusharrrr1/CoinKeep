import React, { useState } from 'react';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import './signin-eth.css';

/*
 Sign In With Ethereum + Supabase flow (Edge Function recommended for production):
 1. User connects wallet (MetaMask / injected provider via window.ethereum).
 2. Request a nonce from Supabase (auth api or custom function) -> we approximate using auth.signInWithOtp fallback if no RPC.
 3. Construct SIWE message and have user sign.
 4. Send signed message to custom RPC (Edge function) that validates signature and retrieves / creates user, returning a JWT.
 For prototype, we perform local verification by calling a (future) RPC endpoint placeholder and store signature & address.
*/

export default function SignInEthereum({ onSuccess }) {
  const [address, setAddress] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setError(null);
    if (!window.ethereum) { setError('No Ethereum provider (install MetaMask).'); return; }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAddress(ethers.getAddress(accounts[0]));
    } catch (e) {
      setError(e.message);
    }
  };

  const signIn = async () => {
    if (!address) return;
    setStatus('signing');
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // Normally request nonce from server. We'll generate a random one for now.
      const nonce = Math.random().toString(36).slice(2, 10);
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = 'Sign in to CoinKeep Business Dashboard';
      const siwe = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: (await provider.getNetwork()).chainId,
        nonce
      });
      const messageToSign = siwe.prepareMessage();
      const signature = await signer.signMessage(messageToSign);
      // Placeholder: In production send (message, signature) to an Edge Function that validates and returns a Supabase session.
      // For prototype we store in localStorage and call onSuccess with pseudo-user.
      localStorage.setItem('ck_user', JSON.stringify({ address, signature, siwe: messageToSign, loggedInAt: Date.now() }));
      if (onSuccess) onSuccess({ address });
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('idle');
    }
  };

  return (
    <div className="siwe-wrapper">
      <div className="siwe-card">
        <h1>Sign In with Ethereum</h1>
        <p className="desc">Authenticate to your business dashboard using your wallet. A cryptographic signature proves ownership of your address. No gas is spent.</p>
        {!address && (
          <button className="siwe-btn" onClick={connectWallet}>Connect Wallet</button>
        )}
        {address && status !== 'done' && (
          <div className="connected-box">
            <div className="addr">{address}</div>
            <button className="siwe-btn primary" disabled={status==='signing'} onClick={signIn}>
              {status==='signing' ? 'Signing…' : 'Sign Message'}
            </button>
          </div>
        )}
        {status==='done' && <div className="success">Signed in!</div>}
        {error && <div className="error-msg">{error}</div>}
        <p className="note">Prototype: Replace local handling with a Supabase Edge Function (verify SIWE, create session).</p>
        <div className="footer-links">
          <a href="https://siwe.xyz" target="_blank" rel="noreferrer">About SIWE</a>
        </div>
      </div>
    </div>
  );
}
