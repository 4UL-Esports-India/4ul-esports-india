import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function App() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [form, setForm] = useState({
   registration_type: "Squad",
    team_name: "",
    captain_name: "",
    whatsapp: "",
    player1: "",
    player2: "",
    player3: "",
    player4: "",
    player5: "",
    utr_number: "",
  });

  const [teams, setTeams] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTeams();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsAdmin(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading teams:", error);
      return;
    }

    setTeams(data || []);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      console.error("Login error:", error);
      setLoginError("❌ Invalid email or password.");
      return;
    }

    setAdminEmail("");
    setAdminPassword("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const updatePaymentStatus = async (teamId, status) => {
    const { error } = await supabase
      .from("teams")
      .update({ payment_status: status })
      .eq("id", teamId);

    if (error) {
      console.error("Status update error:", error);
      alert("Payment status update failed.");
      return;
    }

    setTeams((currentTeams) =>
      currentTeams.map((team) =>
        team.id === teamId
          ? { ...team, payment_status: status }
          : team
      )
    );
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0] || null);
  };

  const handlePaymentChange = (e) => {
    setPaymentFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoFile) {
      setMessage("❌ Please upload team logo.");
      return;
    }

    if (!paymentFile) {
      setMessage("❌ Please upload payment screenshot.");
      return;
    }

    setMessage("Registering...");

    const logoName = `${Date.now()}-${logoFile.name}`;
    const paymentName = `${Date.now()}-${paymentFile.name}`;

    const { error: logoError } = await supabase.storage
      .from("team-logos")
      .upload(logoName, logoFile);

    if (logoError) {
      console.error(logoError);
      setMessage("❌ Team logo upload failed.");
      return;
    }

    const { data: logoData } = supabase.storage
      .from("team-logos")
      .getPublicUrl(logoName);

    const { error: paymentError } = await supabase.storage
      .from("payment-screenshots")
      .upload(paymentName, paymentFile);

    if (paymentError) {
      console.error(paymentError);
      setMessage("❌ Payment screenshot upload failed.");
      return;
    }

    const { data: paymentData } = supabase.storage
      .from("payment-screenshots")
      .getPublicUrl(paymentName);

    const { error } = await supabase.from("teams").insert([
      {
       registration_type: form.registration_type,
        team_name: form.team_name,
        captain_name: form.captain_name,
        whatsapp: form.whatsapp,
        player1: form.player1,
        player2: form.player2,
        player3: form.player3,
        player4: form.player4,
        player5: form.player5,
        logo_url: logoData.publicUrl,
        payment_screenshot_url: paymentData.publicUrl,
        utr_number: form.utr_number,
        payment_status: "Pending",
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("❌ Registration failed. Please try again.");
      return;
    }

    setMessage("✅ Team registered successfully!");

    setForm({
     registration_type: "Squad",
      team_name: "",
      captain_name: "",
      whatsapp: "",
      player1: "",
      player2: "",
      player3: "",
      player4: "",
      player5: "",
      utr_number: "",
    });

    setLogoFile(null);
    setPaymentFile(null);

    e.target.reset();

    fetchTeams();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          4UL <span>ESPORTS INDIA</span>
        </div>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#register">Register</a>
          <a href="#admin">Admin</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <h1>
              4UL <span>ESPORTS INDIA</span>
            </h1>

            <p>
              Welcome to 4UL Esports India. Register your team and
              compete against the best esports teams.
            </p>

            <div className="hero-buttons">
              <a href="#register" className="btn btn-primary">
                REGISTER NOW
              </a>

              <a href="#about" className="btn btn-secondary">
                ABOUT US
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="register">
          <div className="section-title">
            <h2>🏆 Team Registration</h2>
            <p>Enter your team details below</p>
          </div>

          <div className="registration-card">
            <form className="registration-form" onSubmit={handleSubmit}>
              <label>Registration Type</label>

<select
  name="registration_type"
  value={form.registration_type}
  onChange={handleChange}
  required
>
  <option value="Solo">🧍 Solo</option>
  <option value="Duo">👥 Duo</option>
  <option value="Squad">👥 Squad</option>
</select>
<input
                name="team_name"
                placeholder="Guild Name"
                value={form.team_name}
                onChange={handleChange}
                required
              />

              <input
                name="captain_name"
                placeholder="Captain Name"
                value={form.captain_name}
                onChange={handleChange}
                required
              />

              <input
                name="whatsapp"
                type="tel"
                placeholder="WhatsApp Number"
                value={form.whatsapp}
                onChange={handleChange}
                required
              />

              <input
                name="player1"
                placeholder="Player 1 Name"
                value={form.player1}
                onChange={handleChange}
                required
              />

              {(form.registration_type === "Duo" ||
  form.registration_type === "Squad") && (
  <input
    name="player2"
    placeholder="Player 2 Name"
    value={form.player2}
    onChange={handleChange}
    required
  />
)}

         {form.registration_type === "Squad" && (
  <input
    name="player3"
    placeholder="Player 3 Name"
    value={form.player3}
    onChange={handleChange}
    required
  />
)}     

  {form.registration_type === "Squad" && (
  <input
    name="player4"
    placeholder="Player 4 Name"
    value={form.player4}
    onChange={handleChange}
    required
  />
)}        

      {form.registration_type === "Squad" && (
  <input
    name="player5"
    placeholder="Player 5 Name"
    value={form.player5}
    onChange={handleChange}
    required
  />
)}        

              <label>Team Logo</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                required
              />

              <label>Payment Screenshot</label>

              <input
                type="file"
                accept="image/*"
                onChange={handlePaymentChange}
                required
              />

              <input
                name="utr_number"
                placeholder="UTR / Transaction ID"
                value={form.utr_number}
                onChange={handleChange}
                required
              />

              <button type="submit">REGISTER TEAM</button>

              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </section>

        <section className="section" id="admin">
          <div className="section-title">
            <h2>🔐 Admin Dashboard</h2>
            <p>Registered Teams</p>
          </div>

          {!isAdmin ? (
            <div className="registration-card">
              <h3>🔐 Admin Login</h3>

              <form onSubmit={handleAdminLogin}>
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Admin Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />

                <button type="submit">LOGIN</button>

                {loginError && (
                  <p className="message">{loginError}</p>
                )}
              </form>
            </div>
          ) : (
            <>
              <div className="registration-card">
                <h3>✅ Admin Dashboard</h3>

                <p>
                  Welcome to 4UL Esports India Admin Dashboard.
                </p>

                <button type="button" onClick={handleLogout}>
                  LOGOUT
                </button>
              </div>

              <div className="registration-card">
                <h3>Registered Teams: {teams.length}</h3>

                {teams.length === 0 ? (
                  <p>No registered teams found.</p>
                ) : (
                  teams.map((team) => (
                    <div className="card" key={team.id}>
                      <h3>🏆 {team.team_name}</h3>
<p>
  <strong>Registration Type:</strong>{" "}
  {team.registration_type || "Squad"}
</p>
                      <p>
                        <strong>Captain:</strong>{" "}
                        {team.captain_name}
                      </p>

                      <p>
                        <strong>WhatsApp:</strong>{" "}
                        {team.whatsapp}
                      </p>

                      <p>
                        <strong>Player 1:</strong>{" "}
                        {team.player1}
                      </p>

                      <p>
                        <strong>Player 2:</strong>{" "}
                        {team.player2}
                      </p>

                      <p>
                        <strong>Player 3:</strong>{" "}
                        {team.player3}
                      </p>

                      <p>
                        <strong>Player 4:</strong>{" "}
                        {team.player4}
                      </p>

                      <p>
                        <strong>Player 5:</strong>{" "}
                        {team.player5}
                      </p>

                      <p>
                        <strong>UTR:</strong>{" "}
                        {team.utr_number}
                      </p>

                      <p>
                        <strong>Payment Status:</strong>{" "}
                        {team.payment_status}
                      </p>

                      {team.logo_url && (
                        <img
                          src={team.logo_url}
                          alt="Team Logo"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      )}

                      {team.payment_screenshot_url && (
                        <p>
                          <a
                            href={team.payment_screenshot_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            💳 View Payment Screenshot
                          </a>
                        </p>
                      )}

                      <div style={{ marginTop: "15px" }}>
                        <button
                          type="button"
                          onClick={() =>
                            updatePaymentStatus(
                              team.id,
                              "Approved"
                            )
                          }
                        >
                          ✅ APPROVE
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updatePaymentStatus(
                              team.id,
                              "Rejected"
                            )
                          }
                          style={{ marginLeft: "10px" }}
                        >
                          ❌ REJECT
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        <section className="section" id="about">
          <div className="section-title">
            <h2>About 4UL Esports India</h2>

            <p>
              Building competitive esports tournaments and giving
              players a platform to compete, improve and rise to the
              top.
            </p>
          </div>

          <div className="cards">
            <div className="card">
              <h3>🎮 Tournaments</h3>

              <p>
                Participate in exciting esports tournaments organized
                by 4UL Esports India.
              </p>
            </div>

            <div className="card">
              <h3>🏆 Competition</h3>

              <p>
                Compete with talented teams and prove your skills on
                the battlefield.
              </p>
            </div>

            <div className="card">
              <h3>👑 Community</h3>

              <p>
                Join the growing 4UL Esports India gaming community.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        © 2026 4UL Esports India. All Rights Reserved.
      </footer>
    </div>
  );
}

export default App;