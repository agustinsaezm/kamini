export const metadata = { title: 'Kimki — Planes de tratamiento digitales' }

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #fff; color: #0b1c30; }
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.hero {
  background: linear-gradient(135deg, #002f6c 0%, #005EB8 60%, #1a7fd4 100%);
  padding: 48px 24px 56px; text-align: center; position: relative; overflow: hidden;
}
.hero::before {
  content:''; position:absolute; inset:0;
  background: radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.07) 0%, transparent 55%);
}
.logo { display:inline-flex; align-items:center; gap:10px; margin-bottom:32px; }
.logo-circle {
  width:42px; height:42px; border-radius:12px;
  background:rgba(255,255,255,0.18); border:1.5px solid rgba(255,255,255,0.3);
  display:flex; align-items:center; justify-content:center;
  font-size:20px; font-weight:900; color:#fff;
}
.logo-name { font-size:26px; font-weight:900; color:#fff; letter-spacing:-0.5px; }
.hero h1 {
  font-size: clamp(30px,5.5vw,52px); font-weight:900; color:#fff;
  line-height:1.1; letter-spacing:-1.5px; margin-bottom:14px; position:relative;
}
.hero h1 span { color:#7dd3fc; }
.hero p { font-size:17px; color:rgba(255,255,255,0.78); max-width:460px; margin:0 auto 28px; line-height:1.55; }
.cta-btn {
  display:inline-flex; align-items:center; gap:8px;
  background:#fff; color:#005EB8; font-weight:700; font-size:15px;
  padding:13px 26px; border-radius:100px; text-decoration:none;
  box-shadow:0 8px 28px rgba(0,0,0,0.2);
}
.steps-bar { background:#f0f6ff; border-bottom:1px solid #dbeafe; }
.steps-inner { max-width:900px; margin:0 auto; padding:28px 24px; display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
@media(max-width:600px){.steps-inner{grid-template-columns:1fr;}}
.step-pill { display:flex; align-items:center; gap:12px; }
.step-n { width:32px; height:32px; min-width:32px; border-radius:50%; background:#005EB8; color:#fff; font-weight:800; font-size:14px; display:flex; align-items:center; justify-content:center; }
.step-text h4 { font-size:13px; font-weight:700; margin-bottom:1px; }
.step-text p { font-size:12px; color:#6b7280; }
.demo1 { max-width:980px; margin:0 auto; padding:72px 24px; display:grid; grid-template-columns:1fr 1.4fr; gap:56px; align-items:center; }
@media(max-width:700px){.demo1{grid-template-columns:1fr;}}
.label-pill { display:inline-block; background:#e0edff; color:#005EB8; font-size:11px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; padding:5px 12px; border-radius:100px; margin-bottom:12px; }
.demo-title { font-size:clamp(20px,3vw,28px); font-weight:800; letter-spacing:-.4px; margin-bottom:10px; }
.demo-body { font-size:14px; color:#6b7280; line-height:1.6; margin-bottom:20px; max-width:340px; }
.bullets { list-style:none; display:flex; flex-direction:column; gap:8px; }
.bullets li { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#374151; }
.bullet-dot { width:18px; height:18px; min-width:18px; border-radius:50%; background:#005EB8; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='10' height='10'%3E%3Cpath d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:center; margin-top:1px; }
.phone-wrap { display:flex; justify-content:center; }
.phone { width:280px; background:#111827; border-radius:44px; padding:14px; box-shadow:0 40px 100px rgba(0,94,184,0.28), 0 0 0 1px rgba(255,255,255,0.08); }
.phone-notch { width:80px; height:6px; background:#222; border-radius:10px; margin:0 auto 10px; }
.phone-screen { background:#f0f6ff; border-radius:32px; overflow:hidden; }
.ph-header { background:#005EB8; padding:12px 14px 10px; }
.ph-header .app-name { font-weight:900; font-size:13px; color:#fff; }
.ph-header .patient  { font-size:10px; color:rgba(255,255,255,.7); margin-top:1px; }
.ph-body { padding:12px; }
.ph-today { background:#dbeafe; border:1.5px solid #005EB8; border-radius:14px; padding:10px 11px; margin-bottom:10px; }
.ph-today-hdr { display:flex; align-items:center; gap:6px; margin-bottom:8px; }
.hoy-badge { background:#005EB8; color:#fff; font-size:8px; font-weight:800; padding:2px 7px; border-radius:5px; }
.hoy-label { font-size:9px; font-weight:700; color:#005EB8; text-transform:uppercase; letter-spacing:.5px; }
.dose-row { background:#fff; border:1px solid #bfdbfe; border-radius:10px; padding:7px 9px; display:flex; align-items:center; gap:7px; margin-bottom:5px; }
.dose-row:last-child { margin-bottom:0; }
.d-time { font-weight:800; font-size:12px; color:#005EB8; min-width:36px; }
.d-info { flex:1; }
.d-name { font-weight:700; font-size:10px; color:#0b1c30; }
.d-sub  { font-size:9px; color:#6b7280; }
.chk-done { width:22px; height:22px; border-radius:50%; background:#dcfce7; border:1.5px solid #16a34a; display:flex; align-items:center; justify-content:center; font-size:11px; color:#16a34a; font-weight:800; }
.chk-empty { width:22px; height:22px; border-radius:50%; border:1.5px solid #c2c6d4; background:#f9fafb; }
.ph-next { background:#fff; border:1px solid #e5eeff; border-radius:12px; padding:10px 11px; }
.ph-next-lbl { font-size:8.5px; font-weight:700; color:#424752; text-transform:uppercase; letter-spacing:.5px; margin-bottom:7px; }
.divider { height:1px; background:#f0f4ff; max-width:900px; margin:0 auto; }
.demo2 { max-width:980px; margin:0 auto; padding:72px 24px; display:grid; grid-template-columns:1.5fr 1fr; gap:56px; align-items:center; }
@media(max-width:700px){.demo2{grid-template-columns:1fr;}}
.ward { border-radius:18px; overflow:hidden; box-shadow:0 32px 80px rgba(0,94,184,0.18), 0 0 0 1px #e0edff; background:#fff; }
.ward-hdr { background:#005EB8; padding:14px 18px; display:flex; align-items:center; justify-content:space-between; }
.wh-title { font-weight:800; font-size:13px; color:#fff; }
.wh-date  { font-size:11px; color:rgba(255,255,255,.7); }
.wh-nav   { display:flex; gap:6px; }
.nav-btn { width:24px; height:24px; border-radius:6px; background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.3); display:flex; align-items:center; justify-content:center; font-size:12px; color:#fff; }
.wt { width:100%; border-collapse:collapse; }
.wt thead tr { background:#eff4ff; }
.wt th { padding:9px 10px; font-weight:700; color:#424752; font-size:9px; text-transform:uppercase; letter-spacing:.4px; text-align:left; border-bottom:1px solid #e0edff; }
.wt td { padding:9px 10px; border-bottom:1px solid #f0f4ff; vertical-align:middle; font-size:10px; }
.wt tr:last-child td { border-bottom:none; }
.wt tr.overdue { background:#fffbeb; }
.t-time { font-weight:800; font-size:11px; }
.t-time.blue  { color:#005EB8; }
.t-time.amber { color:#d97706; }
.chip { display:inline-flex; align-items:center; gap:4px; padding:3px 7px; border-radius:6px; font-size:9px; font-weight:600; }
.chip.green  { background:#dcfce7; color:#166534; }
.chip.amber  { background:#fef3c7; color:#92400e; }
.chip.gray   { background:#f1f5f9; color:#475569; }
.chip-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.chip-dot.g  { background:#16a34a; }
.chip-dot.a  { background:#d97706; }
.chip-dot.gr { background:#94a3b8; }
.legend { display:flex; gap:16px; padding:10px 14px; background:#f8faff; border-top:1px solid #e0edff; }
.leg-item { display:flex; align-items:center; gap:5px; font-size:9px; color:#6b7280; }
.footer { background:linear-gradient(135deg,#002f6c 0%,#005EB8 100%); padding:56px 24px; text-align:center; }
.footer h2 { font-size:26px; font-weight:900; color:#fff; margin-bottom:8px; letter-spacing:-.5px; }
.footer p  { color:rgba(255,255,255,.75); font-size:15px; margin-bottom:28px; }
.footer-url { display:inline-block; background:rgba(255,255,255,.15); color:#fff; font-size:14px; font-weight:600; padding:10px 24px; border-radius:100px; border:1px solid rgba(255,255,255,.3); margin-top:16px; letter-spacing:.3px; }
`

export default function AboutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <section className="hero">
        <div className="logo">
          <div className="logo-circle">K</div>
          <span className="logo-name">Kimki</span>
        </div>
        <h1>El tratamiento de tu paciente,<br /><span>siempre en su celular</span></h1>
        <p>Crea y comparte planes de medicamentos en minutos. Sin apps, sin papel.</p>
        <a href="https://kamini.vercel.app/register" className="cta-btn">Probar gratis →</a>
      </section>

      <div className="steps-bar">
        <div className="steps-inner">
          <div className="step-pill"><div className="step-n">1</div><div className="step-text"><h4>Creas el tratamiento</h4><p>Medicamentos, dosis y horarios</p></div></div>
          <div className="step-pill"><div className="step-n">2</div><div className="step-text"><h4>Compartes el link o QR</h4><p>Por WhatsApp o en consulta</p></div></div>
          <div className="step-pill"><div className="step-n">3</div><div className="step-text"><h4>El paciente lo sigue</h4><p>Sin registrarse ni instalar nada</p></div></div>
        </div>
      </div>

      <div className="demo1">
        <div>
          <span className="label-pill">Vista del paciente</span>
          <h2 className="demo-title">El paciente ve y registra sus tomas</h2>
          <p className="demo-body">Abre el link desde su celular y tiene todo su calendario listo. Marca cada dosis con un toque.</p>
          <ul className="bullets">
            <li><div className="bullet-dot"></div>Calendario completo organizado por día y hora</li>
            <li><div className="bullet-dot"></div>Marca dosis como tomadas — se guarda en la nube</li>
            <li><div className="bullet-dot"></div>Funciona en cualquier celular sin instalar nada</li>
          </ul>
        </div>
        <div className="phone-wrap">
          <div className="phone">
            <div className="phone-notch"></div>
            <div className="phone-screen">
              <div className="ph-header">
                <div className="app-name">Kimki</div>
                <div className="patient">Plan de Carlos Muñoz</div>
              </div>
              <div className="ph-body">
                <div className="ph-today">
                  <div className="ph-today-hdr">
                    <span className="hoy-badge">HOY</span>
                    <span className="hoy-label">Martes 29 de abril</span>
                  </div>
                  <div className="dose-row"><span className="d-time">08:00</span><div className="d-info"><div className="d-name">Amoxicilina</div><div className="d-sub">500mg · 1 cápsula</div></div><div className="chk-done">✓</div></div>
                  <div className="dose-row"><span className="d-time">14:00</span><div className="d-info"><div className="d-name">Ibuprofeno</div><div className="d-sub">400mg · 1 comprimido</div></div><div className="chk-done">✓</div></div>
                  <div className="dose-row"><span className="d-time">20:00</span><div className="d-info"><div className="d-name">Amoxicilina</div><div className="d-sub">500mg · 1 cápsula</div></div><div className="chk-empty"></div></div>
                </div>
                <div className="ph-next">
                  <div className="ph-next-lbl">Mañana</div>
                  <div className="dose-row" style={{marginBottom:'4px'}}><span className="d-time">08:00</span><div className="d-info"><div className="d-name">Amoxicilina</div><div className="d-sub">500mg</div></div><div className="chk-empty"></div></div>
                  <div className="dose-row"><span className="d-time">14:00</span><div className="d-info"><div className="d-name">Ibuprofeno</div><div className="d-sub">400mg</div></div><div className="chk-empty"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="demo2">
        <div className="ward">
          <div className="ward-hdr">
            <div><div className="wh-title">Vista de turno</div><div className="wh-date">Martes 29 de abril</div></div>
            <div className="wh-nav"><div className="nav-btn">‹</div><div className="nav-btn">›</div></div>
          </div>
          <table className="wt">
            <thead><tr><th style={{width:'56px'}}>Hora</th><th>C. Muñoz</th><th>A. Vega</th><th>P. Rojas</th><th>M. Silva</th></tr></thead>
            <tbody>
              <tr className="overdue">
                <td><span className="t-time amber">08:00</span></td>
                <td><span className="chip green"><span className="chip-dot g"></span>Amoxicilina</span></td>
                <td><span className="chip green"><span className="chip-dot g"></span>Metronidazol</span></td>
                <td><span className="chip amber"><span className="chip-dot a"></span>Ibuprofeno</span></td>
                <td><span className="chip green"><span className="chip-dot g"></span>Enalapril</span></td>
              </tr>
              <tr className="overdue">
                <td><span className="t-time amber">12:00</span></td>
                <td><span className="chip green"><span className="chip-dot g"></span>Ibuprofeno</span></td>
                <td><span className="chip amber"><span className="chip-dot a"></span>Omeprazol</span></td>
                <td><span className="chip amber"><span className="chip-dot a"></span>Ibuprofeno</span></td>
                <td>—</td>
              </tr>
              <tr>
                <td><span className="t-time blue">16:00</span></td>
                <td>—</td>
                <td><span className="chip gray"><span className="chip-dot gr"></span>Metronidazol</span></td>
                <td><span className="chip gray"><span className="chip-dot gr"></span>Ibuprofeno</span></td>
                <td><span className="chip gray"><span className="chip-dot gr"></span>Enalapril</span></td>
              </tr>
              <tr>
                <td><span className="t-time blue">20:00</span></td>
                <td><span className="chip gray"><span className="chip-dot gr"></span>Amoxicilina</span></td>
                <td><span className="chip gray"><span className="chip-dot gr"></span>Metronidazol</span></td>
                <td><span className="chip gray"><span className="chip-dot gr"></span>Ibuprofeno</span></td>
                <td><span className="chip gray"><span className="chip-dot gr"></span>Enalapril</span></td>
              </tr>
            </tbody>
          </table>
          <div className="legend">
            <div className="leg-item"><span className="chip-dot g" style={{width:'8px',height:'8px'}}></span>Administrado</div>
            <div className="leg-item"><span className="chip-dot a" style={{width:'8px',height:'8px'}}></span>Atrasado</div>
            <div className="leg-item"><span className="chip-dot gr" style={{width:'8px',height:'8px'}}></span>Pendiente</div>
          </div>
        </div>
        <div>
          <span className="label-pill">Vista de turno</span>
          <h2 className="demo-title">Todos tus pacientes de un vistazo</h2>
          <p className="demo-body">Ideal para clínicas y hospitales. Una sola pantalla con el estado de cada dosis en tiempo real.</p>
          <ul className="bullets">
            <li><div className="bullet-dot"></div>Pacientes en columnas, horarios en filas</li>
            <li><div className="bullet-dot"></div>Verde, ámbar o gris según el estado</li>
            <li><div className="bullet-dot"></div>Marca dosis directamente desde la grilla</li>
          </ul>
        </div>
      </div>

      <div className="footer">
        <h2>¿Quieres probarlo?</h2>
        <p>Gratis, sin tarjeta de crédito.</p>
        <a href="https://kamini.vercel.app/register" className="cta-btn" style={{background:'#fff',color:'#005EB8',display:'inline-flex'}}>Crear mi cuenta →</a>
        <br /><br />
        <span className="footer-url">kamini.vercel.app</span>
      </div>
    </>
  )
}
