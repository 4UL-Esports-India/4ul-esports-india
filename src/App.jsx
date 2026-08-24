import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function App() {
  const [form, setForm] = useState({
    team_name: "",
    captain_name: "",
    contact: "",
    whatsapp: "",
    player_count: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Registering...");

    const { error } = await supabase.from("teams").insert([
      {
        team_name: form.team_name,
        captain_name: form.captain_name,
        contact: form.contact,
        whatsapp: form.whatsapp,
        player_count: Number(form.player_count),
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("❌ Registration failed. Please try again.");
      return;
    }

    setMessage("✅ Team registered successfully!");

    setForm({
      team_name: "",
      captain_name: "",
      contact: "",
      whatsapp: "",
      player_count: "",
    });
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
              Welcome to 4UL Esports India. Register your team and compete
              against the best esports teams.
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
            <form onSubmit={handleSubmit}>
              <input
                name="team_name"
                placeholder="Team Name"
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
                name="contact"
                type="tel"
                placeholder="Contact Number"
                value={form.contact}
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
                name="player_count"
                type="number"
                placeholder="Player Count"
                value={form.player_count}
                onChange={handleChange}
                min="1"
                max="6"
                required
              />

              <button type="submit">REGISTER TEAM</button>

              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </section>

        <section className="section" id="about">
          <div className="section-title">
            <h2>About 4UL Esports India</h2>
            <p>
              Building competitive esports tournaments and giving players a
              platform to compete, improve and rise to the top.
            </p>
          </div>

          <div className="cards">
            <div className="card">
              <h3>🎮 Tournaments</h3>
              <p>
                Participate in exciting esports tournaments organized by 4UL
                Esports India.
              </p>
            </div>

            <div className="card">
              <h3>🏆 Competition</h3>
              <p>
                Compete with talented teams and prove your skills on the
                battlefield.
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