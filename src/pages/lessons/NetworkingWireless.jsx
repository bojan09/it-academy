import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_NETWORKINGWIRELESS_1 = `# ── Scan for networks ────────────────────────────────────────
nmcli device wifi list
sudo iw dev wlan0 scan | grep -E 'SSID|signal|freq'

# ── Connect to a WPA2-Personal network ───────────────────────
nmcli device wifi connect 'OfficeWiFi' password 'SecurePass123'

# ── Connect to WPA2-Enterprise (802.1X EAP-PEAP) ────────────
nmcli connection add type wifi ssid 'CorpWiFi' \\
  wifi-sec.key-mgmt wpa-eap \\
  802-1x.eap peap \\
  802-1x.phase2-auth mschapv2 \\
  802-1x.identity 'jsmith@corp.com' \\
  802-1x.password 'DomainPass!'
nmcli connection up 'CorpWiFi'

# ── View signal strength and link quality ─────────────────────
iwconfig wlan0
watch -n 1 'cat /proc/net/wireless'

# ── Show connection details ───────────────────────────────────
nmcli connection show 'OfficeWiFi'
iw dev wlan0 link

# ── Disconnect ────────────────────────────────────────────────
nmcli device disconnect wlan0`
const CODE_NETWORKINGWIRELESS_2 = `# Check if wireless interfaces exist
ip link show | grep -E 'wlan|wifi'

# In VMware without a physical wireless adapter:
echo 'No wireless adapter in VM — using wired (ens33)'

# Check network manager status
nmcli general status

# List all connection profiles
nmcli connection show

# Show wireless capabilities of the system
lshw -class network 2>/dev/null | grep -A5 'Wireless\\|WiFi\\|802.11'`
const CODE_NETWORKINGWIRELESS_3 = `No wireless adapter in VM — using wired (ens33)

STATE      CONNECTIVITY  WIFI-HW   WIFI      WWAN-HW   WWAN
connected  full          enabled   enabled   enabled   enabled

NAME        UUID     TYPE      DEVICE
Lab-Network xxxxx    ethernet  ens33`
const CODE_NETWORKINGWIRELESS_4 = `# Show wpa_supplicant version
wpa_supplicant -v 2>&1 | head -2

# Show available EAP methods (for WPA-Enterprise)
wpa_supplicant -v 2>&1 | grep EAP | head -10

# Example wpa_supplicant.conf for WPA2-Enterprise
cat << 'EOF'
# /etc/wpa_supplicant/corp.conf
network={
    ssid="CorpWiFi"
    key_mgmt=WPA-EAP
    eap=PEAP
    identity="jsmith@corp.com"
    password="DomainPassword"
    phase2="auth=MSCHAPV2"
    ca_cert="/etc/ssl/certs/corp-ca.pem"
}
EOF`
const CODE_NETWORKINGWIRELESS_5 = `wpa_supplicant v2.10
EAP methods: EAP-TLS EAP-PEAP EAP-TTLS EAP-PWD EAP-SIM`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between WPA2-Personal and WPA2-Enterprise?',
    options: [
      'WPA2-Personal is older and less secure; WPA2-Enterprise is newer',
      'WPA2-Personal uses a shared pre-shared key (PSK) known to all users; WPA2-Enterprise authenticates each user individually via RADIUS/802.1X with unique credentials — no shared secret',
      'WPA2-Personal is for home networks; WPA2-Enterprise only works in offices',
      'They use different encryption algorithms — AES vs TKIP',
    ],
    correct: 1,
    explanation: 'WPA2-Personal (PSK): one password for the whole network — compromise it and anyone can join. WPA2-Enterprise: each user authenticates with their own credentials (domain username/password, certificate, or token) via an 802.1X authentication server (RADIUS). The AP never sees credentials — it just passes them to RADIUS. Revoke one user without changing the network password. Required for SOC2/HIPAA/PCI-DSS enterprise environments.',
  },
  {
    id: 'q2',
    question: 'What is the 2.4 GHz vs 5 GHz tradeoff in Wi-Fi?',
    options: [
      '2.4 GHz is always better — it has more channels',
      '2.4 GHz has greater range but lower throughput and more interference (only 3 non-overlapping channels, shared with microwaves/Bluetooth); 5 GHz has shorter range but higher throughput and 23+ non-overlapping channels',
      '5 GHz penetrates walls better than 2.4 GHz',
      '2.4 GHz supports Wi-Fi 6; 5 GHz only supports Wi-Fi 5',
    ],
    correct: 1,
    explanation: '2.4 GHz: longer wavelength = better wall penetration and range, but: only 3 non-overlapping channels (1, 6, 11), heavily congested in dense environments (apartments, offices), shared with Bluetooth and microwave ovens. 5 GHz: shorter range but 23 non-overlapping channels and much higher maximum throughput. 6 GHz (Wi-Fi 6E): even more channels, zero legacy interference, but shortest range. Enterprise networks deploy both and let clients connect to the appropriate band.',
  },
  {
    id: 'q3',
    question: 'What is a "deauthentication attack" against Wi-Fi networks?',
    options: [
      'Attempting to guess the Wi-Fi password by brute force',
      'Sending forged 802.11 deauthentication frames to force clients to disconnect, often used to capture the WPA2 4-way handshake for offline password cracking',
      'Physically stealing the wireless access point',
      'Intercepting unencrypted HTTP traffic on public Wi-Fi',
    ],
    correct: 1,
    explanation: 'In legacy 802.11 (pre-WPA3), deauthentication frames are unauthenticated — any device can send them. An attacker sends forged deauth frames forcing clients to disconnect. When the client reconnects, it performs the WPA2 4-way handshake which the attacker captures. The handshake is then cracked offline using dictionary attacks. WPA3 introduces PMF (Protected Management Frames) which authenticates deauth frames, preventing this attack.',
  },
  {
    id: 'q4',
    question: 'What is a "rogue access point" and how can it be detected?',
    options: [
      'An access point with an incorrect SSID configured',
      'An unauthorised AP installed on the network (by an attacker or careless employee) that allows attackers to intercept traffic or bypass network controls — detected via wireless IDS, AP scanning, or 802.1X port authentication',
      'An AP that has exceeded its user limit',
      'A consumer AP used in an enterprise environment',
    ],
    correct: 1,
    explanation: 'A rogue AP is any unauthorised access point connected to your network. Attacker-placed: creates an AP bridging the corporate network to a wireless connection the attacker controls. Employee-placed: plugging in a home router to get wireless in a room — bypasses NAC, creates security holes. Detection: WLAN controllers scan for unknown BSSIDs, compare to authorised AP list, and can automatically block client association to rogues. 802.1X on switch ports prevents unauthorised devices from connecting.',
  },
  {
    id: 'q5',
    question: 'What does SSID broadcast suppression (hiding the SSID) actually achieve for security?',
    options: [
      'It provides strong security by preventing discovery of the network',
      'It provides minimal security — any Wi-Fi scanner sees probe requests from connecting clients revealing the SSID, and the AP still broadcasts it in response to directed probe requests. It only inconveniences legitimate users',
      'It prevents the network from being seen in the device Wi-Fi list',
      'Hidden SSIDs encrypt the network name for added privacy',
    ],
    correct: 1,
    explanation: 'SSID hiding is security theatre. When a client that previously connected walks into range, it sends probe requests broadcasting the SSID name — visible to any scanner. Tools like Wireshark, airodump-ng, or even Windows "netsh wlan show networks mode=bssid" reveal hidden SSIDs trivially. The downside: legitimate users must type the SSID manually, and some devices have trouble with hidden networks. Real wireless security: WPA2/3-Enterprise, PMF, RADIUS, NAC — not SSID hiding.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, language = 'bash', output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                         text-accent-amber text-[11px] font-bold font-mono flex items-center
                         justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language={language} showCopy /></div>}
      {output && (
        <div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3
                        font-mono text-xs text-accent-green leading-6">
          {output.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function NetworkingWireless() {
  return (
    <LessonLayout
      lessonId="net-08"
      courseId="networking"
      title="Wireless Networking"
      courseTitle="Network Fundamentals"
      courseHref="/networking"
      xp={80}
      readTime="~35 min"
      icon="📡"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Networking', href: '/networking' },
        { label: 'Wireless Networking' },
      ]}
      prev={{ title: 'Network Troubleshooting', href: '/networking/troubleshooting' }}
      next={null}
      objectives={[
        'Understand 802.11 standards and the evolution from Wi-Fi 4 to Wi-Fi 6E',
        'Compare WPA2-Personal vs WPA2-Enterprise and choose correctly',
        'Explain the 2.4 GHz vs 5 GHz vs 6 GHz tradeoffs',
        'Understand wireless security threats: evil twin, deauth, rogue AP',
        'Configure Wi-Fi on Linux with nmcli and iw',
        'Diagnose wireless connectivity issues systematically',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Wireless networking is now the primary connectivity method for most end
          devices. Sysadmins need to understand Wi-Fi standards, security protocols,
          and common attack vectors — both to configure enterprise wireless properly
          and to troubleshoot the inevitable "Wi-Fi is slow" support tickets.
        </p>
        <Callout type="info" icon="📡" title="Wireless in the lab context">
          Our VMware lab uses wired connections — but understanding wireless is
          essential for real-world deployments. This lesson covers the concepts and
          tools you'll use when managing enterprise wireless infrastructure.
        </Callout>
      </section>

      <section>
        <h2>Wi-Fi Standards Evolution</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-surface-700">
                <tr>{['Standard','Wi-Fi Name','Year','Max Speed','Bands','Key Feature'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {[
                  ['802.11n',  'Wi-Fi 4', '2009', '600 Mbps',   '2.4/5 GHz',    'MIMO antennas'],
                  ['802.11ac', 'Wi-Fi 5', '2013', '3.5 Gbps',   '5 GHz',         'MU-MIMO, beamforming'],
                  ['802.11ax', 'Wi-Fi 6', '2019', '9.6 Gbps',   '2.4/5 GHz',    'OFDMA, BSS Colouring, TWT — dense deployments'],
                  ['802.11ax', 'Wi-Fi 6E','2021', '9.6 Gbps',   '2.4/5/6 GHz',  '6 GHz band — no legacy interference'],
                  ['802.11be', 'Wi-Fi 7', '2024', '46 Gbps',    '2.4/5/6 GHz',  'Multi-Link Operation, 320 MHz channels'],
                ].map(r => (
                  <tr key={r[0]+r[1]} className="hover:bg-surface-700/30">
                    <td className="px-3 py-2 font-mono text-accent-cyan">{r[0]}</td>
                    <td className="px-3 py-2 font-bold text-white">{r[1]}</td>
                    <td className="px-3 py-2 text-slate-500">{r[2]}</td>
                    <td className="px-3 py-2 text-accent-green font-mono">{r[3]}</td>
                    <td className="px-3 py-2 text-slate-400">{r[4]}</td>
                    <td className="px-3 py-2 text-slate-400 text-[11px]">{r[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2>Security Standards Comparison</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            {
              name: 'WPA2-Personal (PSK)',
              icon: '🏠',
              color: 'border-accent-amber/25 bg-accent-amber/5',
              text: 'text-accent-amber',
              use: 'Home / small office',
              how: 'Single pre-shared key for all users',
              pros: ['Simple setup — one password', 'No server infrastructure needed', 'Supported by all devices'],
              cons: ['Shared secret — one breach exposes all', 'No per-user identity or accountability', 'Password change requires updating all devices'],
            },
            {
              name: 'WPA2/3-Enterprise (802.1X)',
              icon: '🏢',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              use: 'Enterprise / regulated environments',
              how: 'Individual credentials via RADIUS server',
              pros: ['Per-user identity and audit trail', 'Revoke one user without changing password', 'Integrates with Active Directory'],
              cons: ['Requires RADIUS server infrastructure', 'More complex client configuration', 'Certificate management overhead'],
            },
          ].map(s => (
            <div key={s.name} className={`card p-5 border ${s.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className={`font-bold text-sm ${s.text}`}>{s.name}</p>
                  <span className="tag text-[10px]">{s.use}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">{s.how}</p>
              <div className="space-y-1">
                {s.pros.map(p => <div key={p} className="flex gap-2 text-xs text-accent-green"><span>✓</span>{p}</div>)}
                {s.cons.map(c => <div key={c} className="flex gap-2 text-xs text-slate-500"><span>✗</span>{c}</div>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Linux Wireless Management</h2>
        <CodeBlock title="nmcli and iw — wireless tools on Linux" language="bash"
          code={CODE_NETWORKINGWIRELESS_1} />
      </section>

      <section>
        <h2>Common Wireless Problems & Diagnosis</h2>
        <div className="space-y-3 mt-4">
          {[
            { symptom: 'Slow speeds despite good signal', checks: ['Check channel congestion: sudo iw dev wlan0 scan | grep -c DS', 'Verify band: is client on 2.4 GHz when 5 GHz is available?', 'Check for interference: other APs on same channel', 'Run: speedtest-cli and compare to wired'] },
            { symptom: 'Intermittent drops / disconnections', checks: ['Check signal strength: iwconfig wlan0 | grep Quality', 'Review /var/log/syslog for wpa_supplicant messages', 'Check for driver issues: dmesg | grep wlan', 'Verify DHCP lease time and renewal'] },
            { symptom: 'Cannot connect to WPA2-Enterprise', checks: ['Verify RADIUS server is reachable: Test-NetConnection radius-server -Port 1812', 'Check certificate trust: is the CA cert in the device trust store?', 'Review /var/log/auth.log on the RADIUS server', 'Try connecting with wpa_supplicant -d for debug output'] },
          ].map((p, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="px-4 py-3 bg-accent-amber/5 border-b border-surface-700">
                <p className="text-sm font-semibold text-white">⚠️ {p.symptom}</p>
              </div>
              <div className="px-4 py-3 space-y-1">
                {p.checks.map((c, j) => (
                  <p key={j} className="text-xs text-slate-400 font-mono">{j + 1}. {c}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB NET-8</span>
            <span className="text-sm font-semibold text-white">Wireless Concepts on Ubuntu</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Check wireless hardware and driver status on the Ubuntu VM."
              command={CODE_NETWORKINGWIRELESS_2}
              output={CODE_NETWORKINGWIRELESS_3}
            />
            <LabStep number={2}
              description="Explore wireless security configuration with wpa_supplicant (pre-installed)."
              command={CODE_NETWORKINGWIRELESS_4}
              output={CODE_NETWORKINGWIRELESS_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Networking course.</p>
        <Quiz lessonId="net-08" title="Wireless Networking Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
