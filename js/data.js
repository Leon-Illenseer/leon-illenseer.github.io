/* ------------------------------------------------------------------
   Content
------------------------------------------------------------------- */
const projects = [
  { title: 'Preisliste', cat: 'Shopware Store', tag: 'Store-Plugin',
    summary: 'Eigene, im Shopware Store veröffentlichte Erweiterung: kundenindividuelle Preislisten als PDF und CSV für B2B- und B2C-Shops.',
    points: ['Konzeption, Entwicklung und Dokumentation in Eigenverantwortung', 'Store-Veröffentlichung, Versionspflege und laufender Kunden-Support', 'Kundenspezifische Preise sauber aus dem Shop-System exportiert'],
    stack: ['Shopware 6', 'PHP 8', 'Symfony', 'DAL', 'Twig', 'PDF / CSV'] },
  { title: 'Marketing Aktionen', cat: 'Shopware Store', tag: 'Store-Plugin',
    summary: 'Zweite eigene Store-Erweiterung: zeitgesteuerte Banner und Popups, Exit-Intent, Countdowns, Gutscheincodes, A/B-Tests und Statistiken.',
    points: ['Komplette Verantwortung von der Idee bis zur Veröffentlichung', 'A/B-Tests und Statistiken für messbare Kampagnen', 'Versionspflege und Support für Shopbetreiber'],
    stack: ['Shopware 6', 'PHP 8', 'Symfony', 'JavaScript', 'SCSS', 'Storefront-Plugins'] },
  { title: 'Spirituosen-Manufaktur', cat: 'B2C Onlineshop', tag: 'Kundenprojekt',
    summary: 'Konzeption, Umsetzung und Launch eines B2C-Onlineshops für eine Manufaktur handwerklich hergestellter Spirituosen in Norddeutschland - inklusive laufender Betreuung.',
    points: ['Individuelles Storefront-Theme', 'Anbindung von Zahlungs- und Versanddienstleistern', 'Übergabe und laufende Weiterentwicklung nach dem Go-live'],
    stack: ['Shopware 6', 'Twig', 'SCSS', 'Bootstrap', 'Payment-APIs', 'Versand-APIs'] },
  { title: 'Shopware 5 → 6', cat: 'Migration', tag: 'Teamprojekt',
    summary: 'Mitwirkung an der Migration mehrerer Kundenshops von Shopware 5 auf Shopware 6.',
    points: ['Datenübernahme aus den Bestandssystemen', 'Neuaufbau der Storefront auf Shopware 6', 'Ablösung bestehender Erweiterungen durch neue Lösungen'],
    stack: ['Shopware 5', 'Shopware 6', 'MySQL', 'PHP 8', 'Twig'] },
  { title: 'B2B & B2C Relaunches', cat: 'Shop-Weiterentwicklung', tag: 'Teamprojekt',
    summary: 'Mitwirkung an der Neu- und Weiterentwicklung mehrerer B2B- und B2C-Onlineshops im Team.',
    points: ['Geschäftsprozesse und Preislogiken mit Flow Builder und Rule Builder', 'Datenmodellierung und Datenbankmigrationen', 'Tests mit PHPUnit, Deployments über CI/CD in Docker-Umgebungen'],
    stack: ['Shopware 6', 'Flow Builder', 'Rule Builder', 'PHPUnit', 'Docker', 'CI/CD'] },
  { title: 'Schnittstellen', cat: 'Integration', tag: 'Kundenprojekte',
    summary: 'Anbindung externer Systeme an Shopware 6 über Store API, Admin API und Sync API.',
    points: ['Schnittstellen zu Warenwirtschafts-, Zahlungs- und Versandsystemen', 'Performance-Optimierung auf Basis von MySQL', 'Wartung, Monitoring und Support im laufenden Betrieb'],
    stack: ['Store API', 'Admin API', 'Sync API', 'MySQL', 'PHP 8'] },
  { title: 'AR-Spielteppich', cat: 'Unity · AR', tag: 'Garlic Games · 2022',
    summary: 'Implementierung einer AR-Anwendung für einen Bauernhof-Spielteppich in Unity - entstanden im dreimonatigen Praktikum bei Garlic Games.',
    points: ['Interaktive Mechaniken mit Game-Engine-Workflows', 'Augmented Reality als spielerische Technologie für Kinder', 'Dreimonatiges Praktikum im Rahmen der schulischen Ausbildung'],
    stack: ['Unity', 'C#', 'AR', 'Game Design'] },
  { title: 'Shop-Prototyp', cat: 'Lernaufgabe', tag: 'bib · 2021',
    summary: 'Entwurf und Implementierung eines Prototyps für einen Onlineshop mit HTML, CSS und jQuery - der Anfang meiner E-Commerce-Laufbahn.',
    points: ['Selbstständige Problemlösung über zwei Wochen Vollzeit', 'Dokumentation und Präsentation der Ergebnisse', 'Bewertet mit „gut“'],
    stack: ['HTML', 'CSS', 'jQuery'] },
];

/* Museum posters - one per project (viewBox matches the passe-partout opening: 336×266) */
const M = 'font-family="JetBrains Mono, monospace"', G = 'font-family="Space Grotesk, sans-serif"';
// Official Shopware mark (from the press-kit logo, see images/shopware-mark.svg) — trademark of shopware AG
const SW_PATH = 'M34.4031 0C42.9039 7.37548e-07 51.0671 3.12606 57.3802 8.80886C57.5426 8.95265 57.5927 9.18384 57.499 9.38385C57.4114 9.57762 57.2052 9.69634 56.9865 9.6651C54.5363 9.32752 51.8924 9.15886 49.1234 9.15885C39.1038 9.15885 30.9651 11.3968 25.5958 15.6229C20.808 19.3927 18.2766 24.6067 18.2766 30.7083C18.2766 37.5039 20.8834 42.8806 26.2339 47.1443C30.9592 50.9014 37.2533 53.3458 42.8036 55.4964C47.4666 57.3031 51.8737 59.0161 54.8615 61.2667C54.9864 61.3604 55.0552 61.5105 55.0552 61.6667C55.0552 61.8228 54.9801 61.9666 54.8552 62.0604C48.8984 66.4679 41.8288 68.8 34.4031 68.8C25.2086 68.8 16.5704 65.2178 10.076 58.7224C3.57545 52.2269 0 43.5869 0 34.3969C3.47347e-08 25.2131 3.5817 16.5731 10.076 10.0776C16.5766 3.57592 25.2149 0 34.4031 0ZM48.4354 22.4938C55.4923 22.4938 61.2994 24.9255 68.475 30.8833C68.575 30.9646 68.6375 31.0896 68.65 31.2208C68.75 32.3149 68.7938 33.3841 68.8 34.3969C68.8 38.7167 68.0058 42.9365 66.4432 46.9375C66.3932 47.075 66.2807 47.1755 66.1495 47.2255C66.0933 47.2442 66.0369 47.2568 65.9807 47.2568C65.8996 47.2567 65.8182 47.2375 65.7432 47.1938C61.6554 44.9245 57.1987 43.2619 52.8922 41.6552C44.5289 38.5356 37.3094 35.8407 37.3094 29.9328C37.3094 27.8261 38.1911 26.0258 39.8599 24.738C41.785 23.2501 44.6727 22.4938 48.4354 22.4938Z';
// mark at (x, y) with edge length `size`
const swMark = (x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 68.8})"><path d="${SW_PATH}" fill="#0069FC"/></g>`;
const svg = body => `<svg class="poster" viewBox="0 0 336 266" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
const banners = [
  // 01 Preisliste - a customer price sheet, PDF/CSV export
  svg(`<rect width="336" height="266" fill="#e9e5db"/>
    <rect x="44" y="22" width="186" height="224" fill="#fff" stroke="#111" stroke-width="2"/>
    <text x="60" y="52" ${M} font-size="15" font-weight="500" fill="#111">PREISLISTE</text>
    ${swMark(192, 34, 22)}
    <text x="60" y="68" ${M} font-size="10" fill="#555">KUNDE 1042 · B2B</text>
    ${[0,1,2,3,4,5].map(i => `<line x1="60" x2="214" y1="${88 + i * 25}" y2="${88 + i * 25}" stroke="#ddd"/>
      <rect x="60" y="${96 + i * 25}" width="${[70,54,82,62,48,74][i]}" height="7" fill="${i === 2 ? '#6d28d9' : '#bbb'}"/>
      <text x="214" y="${103 + i * 25}" ${M} font-size="10" text-anchor="end" fill="${i === 2 ? '#6d28d9' : '#111'}">${['12,90','8,40','19,99','4,75','31,00','6,20'][i]} €</text>`).join('')}
    <rect x="246" y="58" width="62" height="34" rx="4" fill="#111"/><text x="277" y="80" ${M} font-size="13" font-weight="500" text-anchor="middle" fill="#fff">PDF</text>
    <rect x="246" y="104" width="62" height="34" rx="4" fill="none" stroke="#111" stroke-width="2"/><text x="277" y="126" ${M} font-size="13" font-weight="500" text-anchor="middle" fill="#111">CSV</text>
    <text x="277" y="232" ${G} font-size="84" font-weight="700" text-anchor="middle" fill="#6d28d9" opacity=".9">€</text>`),
  // 02 Marketing Aktionen - countdown, A/B, coupon popup
  svg(`<rect width="336" height="266" fill="#111"/>
    <circle cx="36" cy="34" r="16" fill="#fff"/>${swMark(25, 23, 22)}
    <text x="168" y="62" ${M} font-size="11" text-anchor="middle" letter-spacing="2" fill="#b69cff">ZEITGESTEUERTE AKTION</text>
    <text x="168" y="128" ${M} font-size="50" font-weight="500" text-anchor="middle" fill="#fff">02:14:59</text>
    <text x="168" y="148" ${M} font-size="10" text-anchor="middle" letter-spacing="10" fill="#9a9a94">STD  MIN  SEK</text>
    <rect x="28" y="180" width="40" height="40" fill="none" stroke="#fff" stroke-width="2"/><text x="48" y="207" ${G} font-size="20" font-weight="700" text-anchor="middle" fill="#fff">A</text>
    <rect x="76" y="180" width="40" height="40" fill="#b69cff"/><text x="96" y="207" ${G} font-size="20" font-weight="700" text-anchor="middle" fill="#111">B</text>
    <text x="28" y="242" ${M} font-size="10" fill="#cfcfca">A/B · EXIT-INTENT</text>
    <rect x="186" y="170" width="124" height="68" rx="10" fill="#6d28d9"/>
    <text x="248" y="206" ${G} font-size="28" font-weight="700" text-anchor="middle" fill="#fff">−20 %</text>
    <text x="248" y="226" ${M} font-size="10" text-anchor="middle" fill="#ede7ff">CODE SALE20</text>`),
  // 03 Spirituosen-Manufaktur - bottle with label
  svg(`<rect width="336" height="266" fill="#1b1713"/>
    <circle cx="168" cy="140" r="96" fill="#2a231c"/>
    <rect x="155" y="20" width="26" height="14" rx="2" fill="#6d28d9"/>
    <path d="M156 34h24v50c0 14 30 22 30 46v100c0 6-4 10-10 10h-64c-6 0-10-4-10-10V130c0-24 30-32 30-46z" fill="#efe8da"/>
    <rect x="134" y="148" width="68" height="58" fill="#1b1713"/>
    <text x="168" y="178" ${G} font-size="20" font-weight="700" text-anchor="middle" fill="#efe8da">N°1</text>
    <text x="168" y="195" ${M} font-size="7.5" text-anchor="middle" letter-spacing="1" fill="#b69cff">MANUFAKTUR</text>
    <text x="22" y="246" ${M} font-size="10" letter-spacing="1" fill="#c9c2b3">HANDWERK · B2C</text>
    <text x="314" y="34" ${M} font-size="10" letter-spacing="1" text-anchor="end" fill="#c9c2b3">NORD</text>`),
  // 04 Shopware 5 → 6
  svg(`<rect width="336" height="266" fill="#efece4"/>
    <text x="22" y="206" ${G} font-size="196" font-weight="700" fill="none" stroke="#111" stroke-width="2.5">5</text>
    <text x="198" y="206" ${G} font-size="196" font-weight="700" fill="#111">6</text>
    <path d="M140 124h46m-14-14 14 14-14 14" fill="none" stroke="#6d28d9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    ${swMark(282, 18, 32)}
    <text x="24" y="244" ${M} font-size="10" letter-spacing="1" fill="#333">DATEN · THEME · PLUGINS</text>`),
  // 05 B2B & B2C - two shop windows
  svg(`<rect width="336" height="266" fill="#111"/>
    <rect x="24" y="36" width="176" height="132" rx="6" fill="#1c1c1c" stroke="#efece4" stroke-width="1.5"/>
    <line x1="24" x2="200" y1="54" y2="54" stroke="#efece4" stroke-width="1.5"/>
    ${[0,1,2,3].map(i => `<rect x="38" y="${66 + i * 22}" width="148" height="12" fill="${i ? '#3a3a3a' : '#b69cff'}"/>`).join('')}
    <text x="30" y="28" ${M} font-size="11" font-weight="500" fill="#b69cff">B2B</text>
    <rect x="136" y="98" width="176" height="132" rx="6" fill="#efece4"/>
    <line x1="136" x2="312" y1="116" y2="116" stroke="#111" stroke-width="1.5"/>
    ${[0,1,2].map(i => `<rect x="${148 + i * 54}" y="128" width="46" height="46" fill="#cfcac0"/><rect x="${148 + i * 54}" y="180" width="34" height="6" fill="#111"/>`).join('')}
    <rect x="148" y="200" width="70" height="20" rx="10" fill="#6d28d9"/>
    <text x="306" y="250" ${M} font-size="11" font-weight="500" text-anchor="end" fill="#efece4">B2C</text>`),
  // 06 Schnittstellen - systems wired to Shopware
  svg(`<rect width="336" height="266" fill="#efece4"/>
    ${[[70,62,'ERP'],[266,62,'PAY'],[70,206,'SHIP'],[266,206,'API']].map(([x, y, t]) => `
      <line x1="168" y1="134" x2="${x}" y2="${y}" stroke="#111" stroke-width="1.5" stroke-dasharray="5 5"/>
      <circle cx="${(168 + x) / 2}" cy="${(134 + y) / 2}" r="5" fill="#6d28d9"/>
      <circle cx="${x}" cy="${y}" r="26" fill="#fff" stroke="#111" stroke-width="2"/>
      <text x="${x}" y="${y + 4}" ${M} font-size="11" font-weight="500" text-anchor="middle" fill="#111">${t}</text>`).join('')}
    <circle cx="168" cy="134" r="40" fill="#fff" stroke="#111" stroke-width="2"/>
    ${swMark(144, 110, 48)}`),
  // 07 AR-Spielteppich - isometric farm tile in an AR frame
  svg(`<rect width="336" height="266" fill="#111"/>
    <polygon points="168,74 282,134 168,194 54,134" fill="#262626" stroke="#4a4a4a"/>
    <line x1="111" y1="104" x2="225" y2="164" stroke="#3a3a3a"/><line x1="225" y1="104" x2="111" y2="164" stroke="#3a3a3a"/>
    <path d="M128 140v-22l22-12 22 12v22z" fill="#efece4"/><path d="M122 120l28-17 28 17" fill="none" stroke="#6d28d9" stroke-width="6" stroke-linejoin="round"/>
    <rect x="144" y="126" width="12" height="14" fill="#111"/>
    <line x1="214" y1="140" x2="214" y2="152" stroke="#9a9a94" stroke-width="3"/><circle cx="214" cy="128" r="14" fill="#9a9a94"/>
    ${[[30,30,1,1],[306,30,-1,1],[30,214,1,-1],[306,214,-1,-1]].map(([x, y, a, b]) => `<path d="M${x} ${y + b * 22}V${y}h${a * 22}" fill="none" stroke="#b69cff" stroke-width="3"/>`).join('')}
    <text x="168" y="246" ${M} font-size="11" letter-spacing="2" text-anchor="middle" fill="#cfcfca">AR · UNITY</text>`),
  // 08 Shop-Prototyp - wireframe + jQuery
  svg(`<rect width="336" height="266" fill="#efece4"/>
    <rect x="28" y="26" width="280" height="214" rx="6" fill="#fff" stroke="#111" stroke-width="2"/>
    <line x1="28" x2="308" y1="46" y2="46" stroke="#111" stroke-width="2"/>
    <circle cx="40" cy="36" r="3" fill="#111"/><circle cx="50" cy="36" r="3" fill="#111"/><circle cx="60" cy="36" r="3" fill="#111"/>
    <rect x="42" y="58" width="252" height="56" fill="#e5e1d6"/>
    <text x="56" y="93" ${M} font-size="20" font-weight="500" fill="#6d28d9">$('.shop')</text>
    ${[0,1,2].map(i => `<rect x="${42 + i * 86}" y="126" width="80" height="62" fill="none" stroke="#111" stroke-width="1.5"/>
      <rect x="${50 + i * 86}" y="134" width="64" height="32" fill="#d3cec2"/><rect x="${50 + i * 86}" y="174" width="40" height="6" fill="#111"/>`).join('')}
    <text x="42" y="222" ${M} font-size="10" letter-spacing="1" fill="#333">HTML · CSS · JQUERY · 2021</text>`),
];

const stackHolos = [
  ['Plattform', 'SHOPWARE 6'],
  ['Backend', 'PHP 8 · SYMFONY'],
  ['Frontend', 'TWIG · SCSS · JS'],
  ['Daten & APIs', 'MYSQL · STORE API'],
  ['Workflow', 'GIT · DOCKER · CI/CD'],
  ['Bereits eingesetzt', 'C# · .NET · UNITY'],
];

export { projects, SW_PATH, swMark, banners, stackHolos };
