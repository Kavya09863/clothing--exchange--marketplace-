
import { useEffect, useState } from "react";
import "./App.css";

const initialItems = [
  { id: 1, title: "Classic Denim Jacket", category: "Jackets", size: "M", condition: "Like New", brand: "Levis", value: 1200, owner: "Ananya", location: "Bengaluru", image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600", description: "Stylish denim jacket in excellent condition." },
  { id: 2, title: "Floral Summer Dress", category: "Dresses", size: "S", condition: "Excellent", brand: "H&M", value: 900, owner: "Priya", location: "Bengaluru", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600", description: "Beautiful floral dress for casual outings." },
  { id: 3, title: "White Casual Shirt", category: "Shirts", size: "L", condition: "Good", brand: "Zara", value: 700, owner: "Meera", location: "Mysuru", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600", description: "Comfortable everyday casual shirt." },
  { id: 4, title: "Black Fashion Hoodie", category: "Hoodies", size: "M", condition: "Like New", brand: "Nike", value: 1100, owner: "Kavya", location: "Bengaluru", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600", description: "Warm black hoodie, barely used." },
  { id: 5, title: "Elegant Beige Top", category: "Tops", size: "S", condition: "Excellent", brand: "Forever 21", value: 600, owner: "Sneha", location: "Bengaluru", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600", description: "Elegant top for everyday wear." },
  { id: 6, title: "Blue Denim Jeans", category: "Jeans", size: "M", condition: "Good", brand: "Levis", value: 850, owner: "Rahul", location: "Tumakuru", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600", description: "Classic blue denim jeans." }
];

const readData = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [page, setPage] = useState("Explore");
  const [items, setItems] = useState(() => readData("swap_items", initialItems));
  const [requests, setRequests] = useState(() => readData("swap_requests", []));
  const [messages, setMessages] = useState(() => readData("swap_messages", []));
  const [user, setUser] = useState(() => localStorage.getItem("swap_user") || "Kavya");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [chatText, setChatText] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => localStorage.setItem("swap_items", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("swap_requests", JSON.stringify(requests)), [requests]);
  useEffect(() => localStorage.setItem("swap_messages", JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem("swap_user", user), [user]);

  const categories = ["All", "Dresses", "Shirts", "Tops", "Jackets", "Jeans", "Hoodies"];

  const filtered = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || item.category === category)
  );

  function notify(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  }

  function addItem(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const newItem = {
      id: Date.now(),
      title: f.get("title"),
      category: f.get("category"),
      size: f.get("size"),
      condition: f.get("condition"),
      brand: f.get("brand"),
      value: Number(f.get("value")),
      location: f.get("location"),
      owner: user,
      description: f.get("description"),
      image: f.get("image") || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
    };
    setItems(old => [newItem, ...old]);
    e.target.reset();
    setPage("Explore");
    notify("Your clothing item has been listed!");
  }

  function sendRequest(item) {
    if (item.owner === user) {
      notify("You cannot request your own item.");
      return;
    }
    if (requests.some(r => r.itemId === item.id && r.from === user && r.status === "Pending")) {
      notify("You already requested this item.");
      return;
    }
    setRequests(old => [{
      id: Date.now(),
      itemId: item.id,
      itemTitle: item.title,
      from: user,
      to: item.owner,
      offeredItem: "Open to negotiation",
      status: "Pending"
    }, ...old]);
    setSelected(null);
    notify("Swap request sent successfully!");
  }

  function updateRequest(id, status) {
    setRequests(old => old.map(r => r.id === id ? { ...r, status } : r));
    notify("Request " + status.toLowerCase() + ".");
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!chatText.trim()) return;
    setMessages(old => [...old, { id: Date.now(), from: user, text: chatText, time: new Date().toLocaleTimeString() }]);
    setChatText("");
  }

  function changeUser(e) {
    setUser(e.target.value);
    notify("Switched profile to " + e.target.value);
  }

  const mine = items.filter(i => i.owner === user);
  const received = requests.filter(r => r.to === user);
  const sent = requests.filter(r => r.from === user);

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setPage("Explore")}>
          <span className="brand-icon">♻</span>
          <span>re<span className="brand-green">wear</span></span>
        </a>
        <nav className="nav">
          {["Explore", "Add Item", "Requests", "Messages", "Dashboard", "Admin"].map(p =>
            <button key={p} className={page === p ? "nav-link active" : "nav-link"} onClick={() => {setPage(p); setSelected(null);}}>
              {p}
              {p === "Requests" && received.filter(r => r.status === "Pending").length > 0 && <span className="nav-count">{received.filter(r => r.status === "Pending").length}</span>}
            </button>
          )}
        </nav>
        <div className="profile">
          <span className="avatar">{user.charAt(0)}</span>
          <select value={user} onChange={changeUser} aria-label="Switch demo profile">
            {["Kavya", "Ananya", "Priya", "Meera", "Sneha", "Rahul"].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </header>

      {notice && <div className="toast">{notice}</div>}

      <main>
        {page === "Explore" && <>
          <section className="hero">
            <div>
              <span className="eyebrow">FASHION WITH A SECOND LIFE</span>
              <h1>Good clothes.<br/><span>New stories.</span></h1>
              <p>Give your wardrobe a refresh. Swap the clothes you don't wear for something you'll love.</p>
              <button className="primary-btn" onClick={() => setPage("Add Item")}>List your clothes ↗</button>
            </div>
            <div className="hero-art">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000" alt="Fashion shopping" />
              <div className="hero-note">♻ Wear more. Waste less.</div>
            </div>
          </section>

          <section className="stats">
            <div><strong>{items.length}</strong><span>Clothing listings</span></div>
            <div><strong>{requests.filter(r => r.status === "Accepted").length}</strong><span>Successful matches</span></div>
            <div><strong>{new Set(items.map(i => i.owner)).size}</strong><span>Community members</span></div>
            <div><strong>100%</strong><span>Reuse mindset</span></div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div><span className="eyebrow">FIND YOUR NEXT FAVOURITE</span><h2>Explore the collection</h2></div>
              <span className="muted">{filtered.length} items found</span>
            </div>
            <input className="search" placeholder="Search clothes, brands..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="filters">
              {categories.map(c => <button key={c} className={category === c ? "filter active-filter" : "filter"} onClick={() => setCategory(c)}>{c}</button>)}
            </div>
            <div className="product-grid">
              {filtered.map(item => <article className="product-card" key={item.id}>
                <button className="image-button" onClick={() => setSelected(item)}>
                  <img src={item.image} alt={item.title} />
                  <span className="condition">{item.condition}</span>
                </button>
                <div className="product-info">
                  <span className="product-category">{item.category} · Size {item.size}</span>
                  <h3>{item.title}</h3>
                  <p>{item.brand} · {item.location}</p>
                  <div className="product-bottom"><strong>₹{item.value.toLocaleString("en-IN")} <small>swap value</small></strong><button onClick={() => setSelected(item)}>View item ↗</button></div>
                </div>
              </article>)}
            </div>
            {filtered.length === 0 && <p className="empty">No clothes found. Try another search.</p>}
          </section>
        </>}

        {page === "Add Item" && <section className="form-section">
          <span className="eyebrow">PASS IT ON</span><h1>List a clothing item</h1>
          <p className="muted">Share the details of a piece you'd love someone else to enjoy.</p>
          <form className="listing-form" onSubmit={addItem}>
            <label>Clothing title<input name="title" placeholder="e.g. Blue denim jacket" required /></label>
            <div className="form-row">
              <label>Category<select name="category" required>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select></label>
              <label>Size<select name="size">{["XS","S","M","L","XL","XXL","Free Size"].map(s => <option key={s}>{s}</option>)}</select></label>
            </div>
            <div className="form-row">
              <label>Brand<input name="brand" placeholder="Brand name" required /></label>
              <label>Condition<select name="condition">{["Like New","Excellent","Good"].map(c => <option key={c}>{c}</option>)}</select></label>
            </div>
            <div className="form-row">
              <label>Estimated swap value (₹)<input name="value" type="number" min="1" required placeholder="800" /></label>
              <label>Location<input name="location" required placeholder="Your city" /></label>
            </div>
            <label>Image URL (optional)<input name="image" type="url" placeholder="https://..." /></label>
            <label>Description<textarea name="description" rows="3" required placeholder="Describe your clothing item..." /></label>
            <button className="primary-btn" type="submit">Publish listing ↗</button>
          </form>
        </section>}

        {page === "Requests" && <section className="section page-section">
          <span className="eyebrow">MAKE THE EXCHANGE</span><h1>Swap requests</h1>
          <div className="request-columns">
            <div><h2>Received requests</h2>
              {received.length === 0 && <p className="empty">No requests received yet.</p>}
              {received.map(r => <div className="request-card" key={r.id}><div><strong>{r.from}</strong><p>Wants to swap for <b>{r.itemTitle}</b></p><span className={"status " + r.status}>{r.status}</span></div>
                {r.status === "Pending" && <div className="actions"><button className="accept" onClick={() => updateRequest(r.id,"Accepted")}>Accept</button><button className="reject" onClick={() => updateRequest(r.id,"Rejected")}>Reject</button></div>}
              </div>)}
            </div>
            <div><h2>Sent requests</h2>
              {sent.length === 0 && <p className="empty">You haven't sent any requests.</p>}
              {sent.map(r => <div className="request-card" key={r.id}><div><strong>{r.itemTitle}</strong><p>Requested from {r.to}</p><span className={"status " + r.status}>{r.status}</span></div></div>)}
            </div>
          </div>
        </section>}

        {page === "Messages" && <section className="section page-section">
          <span className="eyebrow">LET'S TALK SWAPS</span><h1>Community chat</h1>
          <div className="chat-box">
            <div className="chat-header"><span className="avatar">R</span><div><strong>Swap community</strong><small>Demo conversation space</small></div></div>
            <div className="chat-messages">
              {messages.length === 0 && <p className="empty">Start the conversation about your next swap.</p>}
              {messages.map(m => <div key={m.id} className={m.from === user ? "message mine-message" : "message"}><b>{m.from}</b><p>{m.text}</p><small>{m.time}</small></div>)}
            </div>
            <form className="chat-input" onSubmit={sendMessage}><input value={chatText} onChange={e => setChatText(e.target.value)} placeholder="Write a message..." /><button className="primary-btn">Send ↗</button></form>
          </div>
        </section>}

        {page === "Dashboard" && <section className="section page-section">
          <span className="eyebrow">YOUR REWEAR SPACE</span><h1>Hello, {user} 👋</h1><p className="muted">Your clothing exchange activity at a glance.</p>
          <div className="dashboard-stats"><div><strong>{mine.length}</strong><span>My listings</span></div><div><strong>{sent.length}</strong><span>Requests sent</span></div><div><strong>{received.length}</strong><span>Requests received</span></div><div><strong>{requests.filter(r => (r.from === user || r.to === user) && r.status === "Accepted").length}</strong><span>Accepted swaps</span></div></div>
          <h2>My clothing listings</h2>
          <div className="product-grid">{mine.map(item => <article className="product-card" key={item.id}><img src={item.image} alt={item.title}/><div className="product-info"><h3>{item.title}</h3><p>₹{item.value} · {item.condition}</p><button className="text-btn" onClick={() => setItems(old => old.filter(i => i.id !== item.id))}>Remove listing</button></div></article>)}</div>
          {mine.length === 0 && <p className="empty">You haven't listed clothes yet.</p>}
        </section>}

        {page === "Admin" && <section className="section page-section">
          <span className="eyebrow">PLATFORM OVERVIEW</span><h1>Admin panel</h1>
          <div className="dashboard-stats"><div><strong>{items.length}</strong><span>Total listings</span></div><div><strong>{new Set(items.map(i => i.owner)).size}</strong><span>Demo users</span></div><div><strong>{requests.length}</strong><span>Swap requests</span></div><div><strong>{requests.filter(r => r.status === "Accepted").length}</strong><span>Accepted swaps</span></div></div>
          <h2>Manage clothing listings</h2>
          {items.map(item => <div className="admin-row" key={item.id}><span>{item.title} · {item.owner}</span><button className="reject" onClick={() => setItems(old => old.filter(i => i.id !== item.id))}>Remove</button></div>)}
        </section>}
      </main>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}>
        <div className="item-modal" onClick={e => e.stopPropagation()}>
          <button className="close" onClick={() => setSelected(null)}>×</button>
          <img src={selected.image} alt={selected.title}/>
          <div className="modal-content"><span className="eyebrow">{selected.category} · SIZE {selected.size}</span><h2>{selected.title}</h2><p>{selected.description}</p><p><b>Brand:</b> {selected.brand} · <b>Condition:</b> {selected.condition}</p><p><b>Owner:</b> {selected.owner} · {selected.location}</p><h3>Estimated swap value: ₹{selected.value}</h3><button className="primary-btn" onClick={() => sendRequest(selected)}>Request this swap ↗</button></div>
        </div>
      </div>}

      <footer>♻ rewear · Give clothes another story. <span>Made for a more sustainable wardrobe.</span></footer>
    </div>
  );
}

export default App;
