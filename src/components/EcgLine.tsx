export default function EcgLine() {
  return (
    <svg
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <polyline
        points="
          0,50 30,50 40,44 50,50 70,50 78,58 82,5 86,65 94,50 120,50 135,40 150,50
          200,50 230,50 240,44 250,50 270,50 278,58 282,5 286,65 294,50 320,50 335,40 350,50
          400,50 430,50 440,44 450,50 470,50 478,58 482,5 486,65 494,50 520,50 535,40 550,50
          600,50 630,50 640,44 650,50 670,50 678,58 682,5 686,65 694,50 720,50 735,40 750,50
          800,50 830,50 840,44 850,50 870,50 878,58 882,5 886,65 894,50 920,50 935,40 950,50
          1000,50 1030,50 1040,44 1050,50 1070,50 1078,58 1082,5 1086,65 1094,50 1120,50 1135,40 1150,50
          1200,50
        "
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2000"
        strokeDashoffset="2000"
        style={{ animation: 'ecg-draw 3s ease forwards' }}
      />
    </svg>
  )
}
