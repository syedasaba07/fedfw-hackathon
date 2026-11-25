import { useEffect, useMemo, useState } from "react";

const ADMIN_EMAIL = "admin@bidlux.com";
const ADMIN_PASSWORD = "admin123";

const initialAuctions = [
  { id: 101, name: "Royal Wrist Watch", category: "Accessories", description: "A classic timepiece for collectors.", emoji: "⌚", startingPrice: 5000, currentBid: 5000, highestBidder: "", endTime: Date.now() + 1000 * 60 * 60 * 8 },
  { id: 102, name: "Luxury Camera", category: "Electronics", description: "A camera for your next creative project.", emoji: "📷", startingPrice: 25000, currentBid: 25000, highestBidder: "", endTime: Date.now() + 1000 * 60 * 60 * 12 },
  { id: 103, name: "Classic Guitar", category: "Music", description: "A beautiful instrument for music lovers.", emoji: "🎸", startingPrice: 12000, currentBid: 12000, highestBidder: "", endTime: Date.now() + 1000 * 60 * 60 * 6 },
  { id: 104, name: "Gaming Laptop", category: "Electronics", description: "A powerful laptop for gaming and study.", emoji: "💻", startingPrice: 45000, currentBid: 45000, highestBidder: "", endTime: Date.now() + 1000 * 60 * 60 * 18 },
  { id: 105, name: "Designer Handbag", category: "Fashion", description: "A stylish accessory in a timeless design.", emoji: "👜", startingPrice: 8000, currentBid: 8000, highestBidder: "", endTime: Date.now() + 1000 * 60 * 60 * 10 },
  { id: 106, name: "Sports Bicycle", category: "Sports", description: "A versatile bicycle for weekend rides.", emoji: "🚲", startingPrice: 15000, currentBid: 15000, highestBidder: "", endTime: Date.now() + 1000 * 60 * 60 * 20 }
];

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function money(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function timeLeft(endTime) {
  const ms = endTime - Date.now();
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m left`;
}

export default function App() {
  const [users, setUsers] = useState(() => readStore("bidluxUsers", []));
  const [auctions, setAuctions] = useState(() => readStore("bidluxAuctions", initialAuctions));
  const [bids, setBids] = useState(() => readStore("bidluxBids", []));
  const [currentUser, setCurrentUser] = useState(() => readStore("bidluxCurrentUser", null));
  const [page, setPage] = useState("home");
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(Date.now());

  useEffect(() => localStorage.setItem("bidluxUsers", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("bidluxAuctions", JSON.stringify(auctions)), [auctions]);
  useEffect(() => localStorage.setItem("bidluxBids", JSON.stringify(bids)), [bids]);
  useEffect(() => {
    if (currentUser) localStorage.setItem("bidluxCurrentUser", JSON.stringify(currentUser));
    else localStorage.removeItem("bidluxCurrentUser");
  }, [currentUser]);
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  function navigate(nextPage) {
    setMessage("");
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function logout() {
    setCurrentUser(null);
    navigate("home");
  }

  function handleAuth(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (authMode === "signup") {
      if (password.length < 6) {
        setMessage("Please use a password with at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
      if (email === ADMIN_EMAIL || users.some((user) => user.email.toLowerCase() === email)) {
        setMessage("This email is already registered.");
        return;
      }
      const newUser = { id: Date.now(), name, email, password, phone: String(form.get("phone") || "").trim(), role: "user" };
      setUsers((old) => [...old, newUser]);
      setCurrentUser(newUser);
      navigate("dashboard");
      return;
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setCurrentUser({ id: "admin", name: "Administrator", email: ADMIN_EMAIL, role: "admin" });
      navigate("admin");
      return;
    }

    const user = users.find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user) {
      setMessage("Incorrect email or password. Please try again.");
      return;
    }
    setCurrentUser(user);
    navigate("dashboard");
  }

  function placeBid(event, auction) {
    event.preventDefault();
    if (!currentUser) {
      setAuthMode("login");
      navigate("auth");
      setMessage("Please log in before placing a bid.");
      return;
    }
    if (currentUser.role === "admin") {
      setMessage("Please use a normal user account to place bids.");
      return;
    }
    if (auction.endTime <= Date.now()) {
      setMessage("This auction has ended.");
      return;
    }
    const amount = Number(new FormData(event.currentTarget).get("amount"));
    if (!Number.isFinite(amount) || amount <= auction.currentBid) {
      setMessage(`Your bid must be greater than ${money(auction.currentBid)}.`);
      return;
    }
    const updatedAuction = { ...auction, currentBid: amount, highestBidder: currentUser.email };
    setAuctions((old) => old.map((item) => item.id === auction.id ? updatedAuction : item));
    setBids((old) => [{ id: Date.now(), auctionId: auction.id, auctionName: auction.name, bidder: currentUser.email, amount, date: new Date().toLocaleString() }, ...old]);
    setMessage(`Your bid of ${money(amount)} was placed successfully!`);
    event.currentTarget.reset();
  }

  function addAuction(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const duration = Number(form.get("duration"));
    const price = Number(form.get("price"));
    const name = String(form.get("name") || "").trim();
    if (!name || !Number.isFinite(price) || price < 1) {
      setMessage("Enter a valid auction name and starting price.");
      return;
    }
    const newAuction = {
      id: Date.now(),
      name,
      category: String(form.get("category") || "Other"),
      description: String(form.get("description") || "New auction item."),
      emoji: String(form.get("emoji") || "🎁"),
      startingPrice: price,
      currentBid: price,
      highestBidder: "",
      endTime: Date.now() + duration * 3600000
    };
    setAuctions((old) => [newAuction, ...old]);
    event.currentTarget.reset();
    setMessage("Auction added successfully.");
  }

  function deleteAuction(id) {
    if (window.confirm("Are you sure you want to delete this auction?")) {
      setAuctions((old) => old.filter((auction) => auction.id !== id));
      setMessage("Auction deleted.");
    }
  }

  const visibleAuctions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return auctions.filter((auction) =>
      `${auction.name} ${auction.category} ${auction.description}`.toLowerCase().includes(term)
    );
  }, [auctions, search, tick]);

  const userBids = currentUser ? bids.filter((bid) => bid.bidder === currentUser.email) : [];
  const highestUserBid = userBids.length ? Math.max(...userBids.map((bid) => bid.amount)) : 0;

  return (
    <div className="app-shell">
      <header className="navbar">
        <button className="brand" onClick={() => navigate("home")}><span className="brand-icon">⚒</span> Bid<span>Lux</span></button>
        <nav className="nav-links">
          <button onClick={() => navigate("home")}>Home</button>
          <button onClick={() => navigate("auctions")}>Auctions</button>
          {currentUser?.role === "user" && <button onClick={() => navigate("dashboard")}>Dashboard</button>}
          {currentUser?.role === "admin" && <button onClick={() => navigate("admin")}>Admin</button>}
        </nav>
        <div className="nav-actions">
          {currentUser ? (
            <>
              <span className="welcome-small">Hi, {currentUser.name.split(" ")[0]}</span>
              <button className="btn btn-outline btn-small" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline btn-small" onClick={() => { setAuthMode("login"); navigate("auth"); }}>Login</button>
              <button className="btn btn-gold btn-small" onClick={() => { setAuthMode("signup"); navigate("auth"); }}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {message && <div className="toast" role="status"><span>{message}</span><button onClick={() => setMessage("")} aria-label="Dismiss message">×</button></div>}

      <main>
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <p className="eyebrow">THE ART OF THE AUCTION</p>
                <h1>Find it. Bid on it.<br /><span>Make it yours.</span></h1>
                <p className="hero-copy">Discover special finds, place your bid, and enjoy the thrill of winning with BidLux.</p>
                <div className="hero-actions">
                  <button className="btn btn-gold" onClick={() => navigate("auctions")}>Explore Auctions <span>→</span></button>
                  {!currentUser && <button className="btn btn-light" onClick={() => { setAuthMode("signup"); navigate("auth"); }}>Create Account</button>}
                </div>
                <div className="hero-trust"><span>✦</span> A simple, student-built online auction experience</div>
              </div>
              <div className="hero-art" aria-label="Auction hammer illustration"><div className="art-glow"></div><div className="art-card card-back">BIDLUX<br /><small>RARE FINDS</small></div><div className="art-card card-front"><span className="art-emoji">🔨</span><small>THE NEXT GREAT FIND</small><strong>YOUR BID. YOUR MOMENT.</strong></div><div className="coin coin-one">₹</div><div className="coin coin-two">✦</div></div>
            </section>
            <section className="stats-strip">
              <div><strong>{auctions.length.toString().padStart(2, "0")}</strong><span>Auctions to explore</span></div>
              <div><strong>{users.length.toString().padStart(2, "0")}</strong><span>Registered bidders</span></div>
              <div><strong>{bids.length.toString().padStart(2, "0")}</strong><span>Bids placed</span></div>
            </section>
            <section className="section">
              <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Featured auctions</h2></div><button className="text-link" onClick={() => navigate("auctions")}>View all auctions →</button></div>
              <AuctionGrid auctions={visibleAuctions.slice(0, 3)} onBid={placeBid} />
            </section>
            <section className="how-section"><p className="eyebrow">SIMPLE BY DESIGN</p><h2>Your next find is four steps away.</h2><div className="steps"><Step number="01" title="Create an account" text="Sign up with your basic details."/><Step number="02" title="Explore finds" text="Browse items and check current bids."/><Step number="03" title="Place a bid" text="Enter an amount above the current bid."/><Step number="04" title="Track progress" text="View your bids in your dashboard."/></div></section>
          </>
        )}

        {page === "auctions" && (
          <section className="section page-section">
            <div className="section-heading"><div><p className="eyebrow">FIND YOUR NEXT FAVOURITE</p><h1>Live auctions</h1><p className="muted">Explore the collection and place your bid.</p></div></div>
            <div className="search-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search items or categories..." aria-label="Search auctions"/><span>{visibleAuctions.length} item(s)</span></div>
            <AuctionGrid auctions={visibleAuctions} onBid={placeBid} />
          </section>
        )}

        {page === "auth" && (
          <section className="auth-wrap">
            <div className="auth-side"><p className="eyebrow">WELCOME TO BIDLUX</p><h1>Good finds.<br/><span>Great stories.</span></h1><p>Join the community, discover unique items, and make every bid count.</p><div className="auth-side-art">🔨 <span>✦</span></div></div>
            <div className="auth-panel">
              <div className="auth-tabs"><button className={authMode === "login" ? "active" : ""} onClick={() => {setAuthMode("login");setMessage("");}}>Login</button><button className={authMode === "signup" ? "active" : ""} onClick={() => {setAuthMode("signup");setMessage("");}}>Create account</button></div>
              <h2>{authMode === "login" ? "Welcome back" : "Create your account"}</h2>
              <p className="muted">{authMode === "login" ? "Enter your details to continue." : "A few details and you’re ready to bid."}</p>
              <form onSubmit={handleAuth} className="form-stack">
                {authMode === "signup" && <label>Full name<input name="name" type="text" placeholder="Your full name" autoComplete="name" required /></label>}
                <label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label>
                {authMode === "signup" && <label>Phone number <span className="optional">(optional)</span><input name="phone" type="tel" placeholder="Your phone number" autoComplete="tel" /></label>}
                <label>Password<input name="password" type="password" placeholder={authMode === "signup" ? "At least 6 characters" : "Enter your password"} autoComplete={authMode === "signup" ? "new-password" : "current-password"} minLength={authMode === "signup" ? 6 : undefined} required /></label>
                {authMode === "signup" && <label>Confirm password<input name="confirmPassword" type="password" placeholder="Enter password again" autoComplete="new-password" minLength="6" required /></label>}
                <button className="btn btn-purple full-width" type="submit">{authMode === "login" ? "Login to BidLux" : "Create account"} <span>→</span></button>
              </form>
              <p className="auth-switch">{authMode === "login" ? "New to BidLux?" : "Already have an account?"} <button onClick={() => {setAuthMode(authMode === "login" ? "signup" : "login");setMessage("");}}>{authMode === "login" ? "Sign up" : "Login"}</button></p>
              {authMode === "login" && <div className="admin-hint"><strong>Review demo admin</strong><span>admin@bidlux.com · admin123</span></div>}
            </div>
          </section>
        )}

        {page === "dashboard" && (
          currentUser?.role === "user" ? (
            <section className="section page-section">
              <p className="eyebrow">YOUR BIDLUX SPACE</p><h1>Welcome, {currentUser.name}.</h1><p className="muted">Keep track of your account and bidding activity.</p>
              <div className="dashboard-stats"><Stat label="Total bids" value={userBids.length}/><Stat label="Highest bid" value={money(highestUserBid)}/><Stat label="Auctions available" value={auctions.filter((a) => a.endTime > tick).length}/></div>
              <div className="panel"><div className="panel-heading"><div><h2>Account information</h2><p className="muted">Your registered details</p></div><span className="role-badge">USER</span></div><div className="account-grid"><Info label="Full name" value={currentUser.name}/><Info label="Email address" value={currentUser.email}/><Info label="Phone number" value={currentUser.phone || "Not provided"}/></div></div>
              <div className="panel"><div className="panel-heading"><div><h2>Your bid history</h2><p className="muted">Your latest bidding activity</p></div><button className="text-link" onClick={() => navigate("auctions")}>Browse auctions →</button></div>
                {userBids.length === 0 ? <div className="empty-state"><span>◇</span><h3>No bids yet</h3><p>Your bids will appear here after you place your first bid.</p><button className="btn btn-purple" onClick={() => navigate("auctions")}>Explore auctions</button></div> :
                <div className="table-wrap"><table><thead><tr><th>Item</th><th>Your bid</th><th>Date</th><th>Status</th></tr></thead><tbody>{userBids.map((bid) => {const auction = auctions.find((a) => a.id === bid.auctionId);const isEnded = auction ? auction.endTime <= tick : true;const isHighest = auction?.highestBidder === currentUser.email;return <tr key={bid.id}><td>{bid.auctionName}</td><td>{money(bid.amount)}</td><td>{bid.date}</td><td><span className={`status ${isEnded ? (isHighest ? "won" : "ended") : (isHighest ? "leading" : "outbid")}`}>{isEnded ? (isHighest ? "Won" : "Ended") : (isHighest ? "Leading" : "Outbid")}</span></td></tr>;})}</tbody></table></div>}
              </div>
            </section>
          ) : <AccessNotice text="Please log in with a user account to view the dashboard." onLogin={() => {setAuthMode("login");navigate("auth");}} />
        )}

        {page === "admin" && (
          currentUser?.role === "admin" ? (
            <section className="section page-section">
              <p className="eyebrow">CONTROL CENTRE</p><h1>Admin dashboard</h1><p className="muted">Manage auction listings and view registered users.</p>
              <div className="dashboard-stats"><Stat label="Total auctions" value={auctions.length}/><Stat label="Registered users" value={users.length}/><Stat label="Total bids" value={bids.length}/></div>
              <div className="panel"><div className="panel-heading"><div><h2>Add a new auction</h2><p className="muted">Enter the item details below.</p></div><span className="role-badge admin-badge">ADMIN</span></div>
                <form className="admin-form" onSubmit={addAuction}>
                  <label>Item name<input name="name" placeholder="e.g. Vintage headphones" required/></label>
                  <label>Category<select name="category" defaultValue="Electronics"><option>Electronics</option><option>Fashion</option><option>Accessories</option><option>Music</option><option>Sports</option><option>Collectibles</option><option>Other</option></select></label>
                  <label>Starting price (₹)<input name="price" type="number" min="1" placeholder="1000" required/></label>
                  <label>Duration<select name="duration" defaultValue="12"><option value="1">1 hour</option><option value="2">2 hours</option><option value="4">4 hours</option><option value="6">6 hours</option><option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option></select></label>
                  <label>Emoji / icon<input name="emoji" placeholder="🎁" maxLength="4"/></label>
                  <label className="wide-field">Description<textarea name="description" placeholder="Describe the item..." rows="3" required/></label>
                  <div className="wide-field"><button className="btn btn-purple" type="submit">＋ Add auction</button></div>
                </form>
              </div>
              <div className="panel"><div className="panel-heading"><div><h2>Manage auctions</h2><p className="muted">Remove listings when required.</p></div></div>
                {auctions.length === 0 ? <p className="empty-line">No auctions available. Add one above.</p> : <div className="table-wrap"><table><thead><tr><th>Item</th><th>Category</th><th>Current bid</th><th>Time left</th><th>Action</th></tr></thead><tbody>{auctions.map((a) => <tr key={a.id}><td><span className="table-item-emoji">{a.emoji}</span>{a.name}</td><td>{a.category}</td><td>{money(a.currentBid)}</td><td>{timeLeft(a.endTime)}</td><td><button className="delete-button" onClick={() => deleteAuction(a.id)}>Delete</button></td></tr>)}</tbody></table></div>}
              </div>
              <div className="panel"><div className="panel-heading"><div><h2>Registered users</h2><p className="muted">Accounts created through Sign Up.</p></div></div>
                {users.length === 0 ? <p className="empty-line">No registered users yet.</p> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr></thead><tbody>{users.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone || "—"}</td><td><span className="status leading">User</span></td></tr>)}</tbody></table></div>}
              </div>
            </section>
          ) : <AccessNotice text="Admin access is required. Please log in with the demo admin account." onLogin={() => {setAuthMode("login");navigate("auth");}} />
        )}
      </main>

      <footer className="footer"><button className="footer-brand" onClick={() => navigate("home")}>⚒ BidLux</button><p>Bid smart. Find something extraordinary.</p><span>© {new Date().getFullYear()} BidLux · Online Auction System · Student Project</span></footer>
    </div>
  );
}

function AuctionGrid({ auctions, onBid }) {
  if (!auctions.length) return <div className="empty-state"><span>◇</span><h3>No auctions found</h3><p>Try a different search or check back later.</p></div>;
  return <div className="auction-grid">{auctions.map((auction) => <article className="auction-card" key={auction.id}>
    <div className="auction-visual"><span className="category-pill">{auction.category}</span><span className="item-emoji">{auction.emoji}</span><span className="time-pill">{timeLeft(auction.endTime)}</span></div>
    <div className="auction-info"><h3>{auction.name}</h3><p>{auction.description}</p><div className="bid-info"><div><span>Current bid</span><strong>{money(auction.currentBid)}</strong></div><div className="bid-count"><span>Starting at</span><strong>{money(auction.startingPrice)}</strong></div></div>
      {auction.endTime <= Date.now() ? <button className="btn btn-disabled full-width" disabled>Auction ended</button> : <form className="bid-form" onSubmit={(event) => onBid(event, auction)}><input name="amount" type="number" min={auction.currentBid + 1} step="1" placeholder={`Bid above ${money(auction.currentBid)}`} aria-label={`Bid amount for ${auction.name}`} required/><button className="btn btn-purple" type="submit">Place bid</button></form>}
    </div>
  </article>)}</div>;
}

function Step({ number, title, text }) {
  return <div className="step"><span>{number}</span><h3>{title}</h3><p>{text}</p></div>;
}
function Stat({ label, value }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div>;
}
function Info({ label, value }) {
  return <div className="info-box"><span>{label}</span><strong>{value}</strong></div>;
}
function AccessNotice({ text, onLogin }) {
  return <section className="section page-section"><div className="empty-state access-notice"><span>🔐</span><h2>Access restricted</h2><p>{text}</p><button className="btn btn-purple" onClick={onLogin}>Go to login</button></div></section>;
}