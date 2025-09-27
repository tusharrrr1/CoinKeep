import React, { useState, useEffect } from 'react';
import './App.css';

// Simple in-memory auth mock (replace later with real backend / JWT)
const useAuth = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ck_user');
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load user from storage', e);
    }
  }, []);
  const login = (email, org) => {
    const u = { email, org, loggedInAt: Date.now() };
    try {
      localStorage.setItem('ck_user', JSON.stringify(u));
    } catch (e) {
      console.warn('Failed to persist user', e);
    }
    setUser(u);
  };
  const logout = () => {
    try { localStorage.removeItem('ck_user'); } catch(_) {}
    setUser(null);
  };
  return { user, login, logout };
};

const NavItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`ck-nav-item ${active ? 'active' : ''}`}
  >{label}</button>
);

const Layout = ({ current, setCurrent, logout, org }) => {
  const items = ['Dashboard','Payments','Batch','Files','Billing','Developers','Settings'];
  return (
    <div className="ck-layout">
      <aside className="ck-sidebar">
        <div className="ck-brand">CoinKeep</div>
        <div className="ck-org">{org}</div>
        <nav className="ck-nav">
          {items.map(i => (
            <NavItem key={i} label={i} active={current === i} onClick={() => setCurrent(i)} />
          ))}
        </nav>
        <div className="ck-spacer" />
        <button className="ck-logout" onClick={logout}>Logout</button>
      </aside>
      <main className="ck-main">
        <Header title={current} />
        <div className="ck-content">
          <Section name={current} />
        </div>
      </main>
    </div>
  );
};

const Header = ({ title }) => (
  <div className="ck-header">
    <h1>{title}</h1>
  </div>
);

// Placeholder content components
const Section = ({ name }) => {
  switch(name) {
    case 'Dashboard':
      return <Dashboard />;
    case 'Payments':
      return <Payments />;
    case 'Batch':
      return <Batch />;
    case 'Files':
      return <Files />;
    case 'Billing':
      return <Billing />;
    case 'Developers':
      return <Developers />;
    case 'Settings':
      return <Settings />;
    default:
      return <div>Unknown section</div>;
  }
};

const Dashboard = () => (
  <div className="ck-panel-grid">
    <Panel title="Total Volume (30d)">—</Panel>
    <Panel title="Tx Count (30d)">—</Panel>
    <Panel title="Avg Fee">—</Panel>
    <Panel title="Active Chains">—</Panel>
    <div className="ck-full">
      <Panel title="Recent Cross-Chain Payments">No data yet</Panel>
    </div>
  </div>
);

const Payments = () => (
  <div>
    <h2>Initiate Payment</h2>
    <p>Form for single cross-chain payment (source chain, destination chain, token, amount, recipient, bridge provider e.g. LiFi / Socket) will go here.</p>
    <div className="ck-placeholder-box">Payment Form Placeholder</div>
    <h3 style={{marginTop:'2rem'}}>Recent Payments</h3>
    <table className="ck-table"><thead><tr><th>Time</th><th>From</th><th>To</th><th>Token</th><th>Amount</th><th>Status</th></tr></thead><tbody><tr><td colSpan="6">No payments yet</td></tr></tbody></table>
  </div>
);

const Batch = () => (
  <div>
    <h2>Batch Transfers</h2>
    <p>Upload CSV / JSON to execute many cross-chain payouts (e.g. payroll, settlements).</p>
    <div className="ck-upload-zone">Drop file or click to select</div>
    <h3 style={{marginTop:'2rem'}}>History</h3>
    <table className="ck-table"><thead><tr><th>Batch ID</th><th>File</th><th>Entries</th><th>Submitted</th><th>Status</th></tr></thead><tbody><tr><td colSpan="5">No batches yet</td></tr></tbody></table>
  </div>
);

const Files = () => (
  <div>
    <h2>Managed Files</h2>
    <p>Securely stored payout templates and previously uploaded batch source files.</p>
    <ul className="ck-file-list"><li>No files</li></ul>
  </div>
);

const Billing = () => (
  <div>
    <h2>Billing & Usage</h2>
    <div className="ck-panel-grid">
      <Panel title="Current Plan">Starter</Panel>
      <Panel title="Monthly Volume">—</Panel>
      <Panel title="Remaining Quota">—</Panel>
    </div>
    <h3>Invoices</h3>
    <table className="ck-table"><thead><tr><th>Date</th><th>Invoice #</th><th>Amount</th><th>Status</th></tr></thead><tbody><tr><td colSpan='4'>No invoices</td></tr></tbody></table>
  </div>
);

const Developers = () => (
  <div>
    <h2>Developers</h2>
    <p>API Keys, Webhooks, and SDK examples.</p>
    <div className="ck-api-keys">
      <h3>API Keys</h3>
      <div className="ck-placeholder-box">Generate / rotate keys UI</div>
    </div>
    <h3 style={{marginTop:'2rem'}}>Webhooks</h3>
    <div className="ck-placeholder-box">Configure webhook endpoints</div>
  </div>
);

const Settings = () => (
  <div>
    <h2>Organization Settings</h2>
    <form className="ck-form">
      <label>Org Name<input placeholder="Organization" disabled value="Demo Org" /></label>
      <label>Contact Email<input placeholder="contact@org.com" disabled value="contact@example.com" /></label>
      <label>Timezone<select disabled><option>UTC</option></select></label>
    </form>
  </div>
);

const Panel = ({ title, children }) => (
  <div className="ck-panel">
    <div className="ck-panel-head">{title}</div>
    <div className="ck-panel-body">{children}</div>
  </div>
);

const Login = ({ onLogin }) => {
  const [email,setEmail] = useState('');
  const [org,setOrg] = useState('');
  const submit = e => { e.preventDefault(); if(!email||!org) return; onLogin(email,org); };
  return (
    <div className="ck-auth-wrapper">
      <form className="ck-auth-form" onSubmit={submit}>
        <h1>Sign in to CoinKeep</h1>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
        <label>Organization Name<input value={org} onChange={e=>setOrg(e.target.value)} required /></label>
        <button type="submit">Continue</button>
        <p className="ck-auth-note">This is a prototype. Authentication is mock only.</p>
      </form>
    </div>
  );
};

function App() {
  const { user, login, logout } = useAuth();
  const [current, setCurrent] = useState('Dashboard');
  if (!user) return <Login onLogin={login} />;
  return <Layout current={current} setCurrent={setCurrent} logout={logout} org={user.org} />;
}

export default App;
