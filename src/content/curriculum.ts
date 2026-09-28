/**
 * Curated structure of the three training decks and a beginner track built from them.
 *
 * Everything here was derived by reading the digitized pages: section boundaries come from the
 * agenda / title slides, and every key point and quiz answer carries the page it was taken from so a
 * learner can open the source. Edit this file to change the course; no database changes are needed.
 */
import type { SourceName } from "@/lib/sources";

export type Section = { title: string; pages: [number, number]; note?: string };
export type DocOutline = { source: SourceName; blurb: string; sections: Section[] };

export const OUTLINES: DocOutline[] = [
  {
    source: "Electrical Training",
    blurb:
      "Electrical basics and hazards, reading Herrenknecht wiring diagrams, PLC fundamentals (Simatic S7), I/O hardware diagnostics, fieldbus, and the mobile data transfer (MDT) system.",
    sections: [
      { title: "Agenda and training objectives", pages: [2, 3] },
      { title: "Current, voltage and resistance", pages: [4, 9] },
      { title: "Alternating and direct current", pages: [10, 12] },
      { title: "Electrical hazards: recognising and evaluating risks", pages: [13, 24] },
      { title: "Effects of current on the human body, electrical burns", pages: [25, 28] },
      { title: "Electrical safety, work limits for non-electricians, the 5 safety rules", pages: [29, 31] },
      { title: "Reading electrical schematics (title block, contents, structure identifiers)", pages: [32, 53] },
      { title: "Electric panel, IEC symbols, equipment category letters", pages: [54, 58] },
      { title: "Jobsite overview and options for composing PBA systems", pages: [59, 62] },
      { title: "Programmable logic control (PLC): what it is, inputs, outputs, NO/NC contacts", pages: [63, 71] },
      { title: "Number systems, bits, bytes, words and addressing", pages: [72, 82] },
      { title: "Programming languages and logic functions (AND, OR, negation)", pages: [83, 96] },
      { title: "Simatic S7 assembly, working principle, program structure, memory reset", pages: [97, 112] },
      { title: "Information system / visualisation", pages: [113, 121], note: "Mostly screenshots; little OCR text." },
      { title: "PLC hardware: Simatic S7-400, S7-300, software PLC IPC427", pages: [122, 143] },
      { title: "Beckhoff and WAGO I/O modules, fieldbus couplers, LED blink codes", pages: [144, 177] },
      { title: "WAGO safety modules and feedback monitoring", pages: [178, 193] },
      { title: "Fieldbus topology: Profibus and Profinet", pages: [194, 206] },
      { title: "Compilation options for PBA systems", pages: [207, 209] },
      { title: "Mobile Data Transfer (MDT): network, routers, access, HK.Connected, troubleshooting", pages: [210, 234] },
    ],
  },
  {
    source: "Pipe Jacking",
    blurb:
      "Why trenchless pipe jacking, the machine families (AVN slurry, EPB, partial-face, hard rock), the jacking method, jobsite and shaft setup, operating an AVN in different ground, and the bentonite lubrication system.",
    sections: [
      { title: "Advantages of trenchless technology versus open cut", pages: [2, 12] },
      { title: "Overview of pipe jacking machine types", pages: [13, 20] },
      { title: "Pipe jacking method: shaft, jobsite, process, friction, jacking forces, interjacks, bentonite, measuring systems, separation, trends, long-distance and curved drives", pages: [21, 39] },
      { title: "AVN / AVND slurry machines and reference projects", pages: [40, 49] },
      { title: "EPB machines", pages: [50, 55] },
      { title: "Partial-face machines MH / MHSM", pages: [56, 63] },
      { title: "Hard rock machines", pages: [64, 67] },
      { title: "Jobsite setup: planning the jobsite, jacking team", pages: [68, 84] },
      { title: "Shaft construction", pages: [85, 93] },
      { title: "Launch shaft and tunnel equipment, launch seals", pages: [94, 115] },
      { title: "Separation plant and muck handling", pages: [116, 120] },
      { title: "Recovery (wet and dry)", pages: [121, 135] },
      { title: "Operation in different ground conditions (AVN): development limits, cutterhead types, operation, rock, gravel/sand, loam", pages: [136, 156] },
      { title: "Module 1 Operation: control elements and the visualisation", pages: [157, 252], note: "Mostly screenshots of the operator screens; little OCR text." },
      { title: "Volume-controlled bentonite lubrication system, incl. troubleshooting", pages: [253, 280] },
    ],
  },
  {
    source: "Drawings & Part Lists",
    blurb:
      "How to find and order spare parts from the technical documentation, how hydraulic drawings are structured, the grease lubrication system, filters and accumulators, maintenance schedules, oil analysis, and hydraulic pump types.",
    sections: [
      { title: "Order transaction: proximity switch (worked example)", pages: [2, 15] },
      { title: "Order transaction: disc cutter (worked example)", pages: [16, 25] },
      { title: "Structure of drawings and drawing samples (grease, bentonite, water, steering, cutting wheel drive, gearbox lubrication, interjack)", pages: [26, 43] },
      { title: "Grease lubrication system: components, distributor function, malfunctions", pages: [44, 67] },
      { title: "Hydraulic return / suction filter", pages: [68, 78] },
      { title: "Accumulators: bladder and membrane", pages: [79, 86] },
      { title: "Maintenance: safety rules, schedule, oil sampling, oil change, filter change", pages: [87, 116] },
      { title: "Mechanics maintenance (AVN 700 / AVN 800 to 1200): cutterhead and crusher, water circuit, HP pumps, gearbox, seals, articulation, consumables", pages: [117, 168] },
      { title: "Oil analysis and oil sampling, laboratory reports", pages: [169, 192] },
      { title: "Hydraulic pumps: Linde HPR, Rexroth A4VG, Rexroth A4CSG, Dynex", pages: [193, 242] },
    ],
  },
];

export function outlineFor(source: string) {
  return OUTLINES.find((o) => o.source === source);
}

export type KeyPoint = { text: string; page: number };
export type QuizQuestion = { q: string; options: string[]; answer: number; page: number };
export type Module = {
  slug: string;
  title: string;
  source: SourceName;
  minutes: number;
  summary: string;
  reading: { pages: [number, number]; label: string }[];
  keyPoints: KeyPoint[];
  quiz: QuizQuestion[];
};

export const BEGINNER_TRACK: Module[] = [
  {
    slug: "why-pipe-jacking",
    title: "What pipe jacking is and why it is used",
    source: "Pipe Jacking",
    minutes: 20,
    summary:
      "Start here. Pipe jacking replaces open-cut trenches with a tunnelling machine pushed forward from a launch shaft by a jacking station. This module covers the benefits, the main jobsite components, and the numbers that shape a drive.",
    reading: [
      { pages: [3, 12], label: "Replacing the open-cut method and its advantages" },
      { pages: [22, 27], label: "Jobsite components, shaft, jacking process" },
      { pages: [28, 39], label: "Friction, jacking forces, interjacks, bentonite, measuring systems, drive lengths" },
    ],
    keyPoints: [
      { text: "Trenchless installation means less noise and air pollution, lower accident risk, less impact on traffic and roads, no lowering of groundwater, lower settlement risk, and crossings under rivers, buildings and roads that open cut cannot do.", page: 5 },
      { text: "A typical AVN jobsite has a separation plant, feed and slurry lines, pipe stock, the slurry TBM, an airlock, a control container and the main jacking station.", page: 22 },
      { text: "Pipe friction depends on pipe type, pipe lubrication, continuous jacking versus standstill, and ground conditions.", page: 28 },
      { text: "Intermediate jacking stations (interjacks) are installed at intervals on longer drives so the whole pipe string does not have to be moved at once; the cylinders are removed after the tunnel is finished.", page: 30 },
      { text: "The bentonite lubrication system reduces skin friction between machine/pipes and the ground; volume control lets distribution follow changing geology.", page: 31 },
      { text: "Guideline maximum drive lengths: ID 1600 about 700 m, ID 1800 about 900 m, ID 2000 and larger about 1,100 m.", page: 38 },
      { text: "Curved drives allow a maximum opening angle of 0.5 degrees per joint, so the minimum radius depends on pipe length: 4 m pipes need about 460 m, 1.5 m pipes about 170 m.", page: 39 },
    ],
    quiz: [
      { q: "What is the purpose of an intermediate jacking station (interjack)?", options: ["To separate slurry from excavated material", "To reduce jacking forces at the launch shaft by moving the pipe string in parts", "To measure the machine position on long drives", "To lubricate the pipe string with bentonite"], answer: 1, page: 30 },
      { q: "According to the guideline, roughly how long can an ID 1800 drive be?", options: ["About 400 m", "About 700 m", "About 900 m", "About 1,100 m"], answer: 2, page: 38 },
      { q: "Why is bentonite pumped around the pipe string?", options: ["To support the tunnel face", "To cool the cutterhead", "To reduce skin friction between pipes and ground", "To seal the launch shaft"], answer: 2, page: 31 },
    ],
  },
  {
    slug: "machine-types",
    title: "Machine types: AVN slurry, EPB, partial-face and hard rock",
    source: "Pipe Jacking",
    minutes: 20,
    summary:
      "Which machine goes into which ground. The deck compares face support and muck removal for each family and gives the operating limits crews should know.",
    reading: [
      { pages: [14, 20], label: "Face support, muck removal, diameters, geology, cost comparison" },
      { pages: [42, 45], label: "AVN / AVND slurry machine design" },
      { pages: [51, 53], label: "EPB machines and their advantages" },
      { pages: [57, 59], label: "Partial-face machines MH / MHSM" },
      { pages: [65, 66], label: "Hard rock machines" },
    ],
    keyPoints: [
      { text: "AVN / AVND: full-face cutting wheel, face supported by slurry suspension, muck transported in the slurry circuit (separation needed).", page: 18 },
      { text: "EPB: full-face cutting wheel, face supported by earth pressure, muck removed by screw conveyor, belt or muck skip.", page: 18 },
      { text: "Partial-face machines (excavator or roadheader): mechanical face support, muck by belt conveyor and muck skip.", page: 18 },
      { text: "Slurry machines are rated up to 3 bar as a guideline; higher pressure is possible with additional measures.", page: 15 },
      { text: "EPB advantages over slurry: lower investment, high advance rates in cohesive soil, less space, simpler setup, no slurry treatment, lower energy use.", page: 52 },
      { text: "An AVN machine consists of the cutterhead, cone crusher, slurry line, steering cylinders, steering articulation, main drive and feed lines.", page: 45 },
    ],
    quiz: [
      { q: "How is the tunnel face supported on an AVN slurry machine?", options: ["Mechanically by support plates", "By earth pressure in the excavation chamber", "By a pressurised slurry suspension", "By compressed air only"], answer: 2, page: 18 },
      { q: "Which machine type removes muck with a screw conveyor?", options: ["AVN slurry machine", "EPB machine", "Partial-face machine", "Hard rock TBM"], answer: 1, page: 18 },
      { q: "Which is listed as an advantage of EPB over slurry machines?", options: ["Suitable for all ground types", "Maximum safety in permeable ground", "No slurry treatment or disposal", "Higher groundwater pressure rating"], answer: 2, page: 52 },
    ],
  },
  {
    slug: "jobsite-and-shaft",
    title: "Setting up the jobsite and the launch shaft",
    source: "Pipe Jacking",
    minutes: 25,
    summary:
      "What has to be planned before the machine arrives, what a good jacking shaft looks like, and what must be installed in it.",
    reading: [
      { pages: [71, 82], label: "Planning the jobsite: site visit, power, layout plan, documents, ground" },
      { pages: [83, 84], label: "Jacking team: work above ground, in the shaft and tunnel" },
      { pages: [85, 93], label: "Shaft construction: suitable and unsuitable designs" },
      { pages: [94, 115], label: "Launch shaft and tunnel equipment, launch seals" },
    ],
    keyPoints: [
      { text: "Planning covers the site visit, terrain and traffic, water supply and waste water, geological information and water table, storage of removed soil, survey coordinates, contact numbers, permits and security.", page: 71 },
      { text: "Power supply: generators or mains, the earthing system (TN-S, TN-C, TT, IT), and the length and diameter of cables.", page: 72 },
      { text: "The construction site layout plan defines traffic routes and lifting ranges. Important: if possible, do not position heavy equipment along the tunnel axis.", page: 76 },
      { text: "Jobsite documents include the pipe plan, bentonite mixtures, shaft dimensions, tunnel length and slope, maximum allowed jacking force, alignment tolerances, support pressure, hold points and geology plan.", page: 78 },
      { text: "The jacking shaft must withstand the maximum allowed jacking forces, be watertight, have walls above ground level to prevent flooding, and use glass-fibre reinforcement at the soft eyes instead of steel.", page: 85 },
      { text: "Shaft installations: ladder or stair tower plus a second exit route, dewatering pumps with a spare emergency pump, service line tower, ventilation, working platform and survey points.", page: 94 },
    ],
    quiz: [
      { q: "Where should heavy equipment not be positioned if possible?", options: ["Next to the separation plant", "Along the tunnel axis", "Beside the site office", "Near the pipe stock"], answer: 1, page: 76 },
      { q: "What reinforcement is recommended at the soft eyes of a concrete shaft?", options: ["Steel", "Glass fibre", "Timber", "None"], answer: 1, page: 85 },
      { q: "Which item must always be available in the shaft according to the equipment list?", options: ["A spare emergency dewatering pump", "A second jacking frame", "A backup cutterhead", "A concrete mixer"], answer: 0, page: 94 },
    ],
  },
  {
    slug: "operating-avn",
    title: "Operating an AVN in different ground conditions",
    source: "Pipe Jacking",
    minutes: 20,
    summary:
      "The operator's basic procedure for starting an advance and the pressure rules that avoid wash-outs at the face.",
    reading: [
      { pages: [139, 142], label: "Objectives, development limits, cutterhead types" },
      { pages: [143, 148], label: "Operation: starting the advance and during tunnelling" },
      { pages: [149, 156], label: "Rock, gravel/sand and loam" },
    ],
    keyPoints: [
      { text: "Training objectives: safety when operating the tunnelling machine and avoiding settlements or uplifts.", page: 139 },
      { text: "Development limits by outer diameter: AVN/AVND slurry 0.4 to 4.2 m, EPB shield 1.7 to 16.0 m, gripper TBM 2.0 to 12.5 m, single shield 1.5 to 14.0 m, double shield 2.8 to 12.5 m.", page: 141 },
      { text: "Cutterheads are designed for soft soil, mixed soil or hard rock.", page: 142 },
      { text: "General procedure to start the advance: open the bypass, then start the water circuit.", page: 143 },
      { text: "During tunnelling set the water flow rate, and choose the advance rate so the cutting wheel pressure stays at least 90 to 100 bar to avoid wash-outs. If the pressure is still under 80 bar at the highest advance rate, reduce the water flow to the lowest allowed limit.", page: 147 },
    ],
    quiz: [
      { q: "What is the first step of the general procedure to start the advance?", options: ["Start the water circuit", "Open the bypass", "Close the slurry line", "Retract the jacking cylinders"], answer: 1, page: 143 },
      { q: "The advance rate should keep the cutting wheel pressure at least…", options: ["20 to 30 bar", "50 to 60 bar", "90 to 100 bar", "150 to 200 bar"], answer: 2, page: 147 },
      { q: "What is the outer diameter range of AVN / AVND slurry machines?", options: ["0.4 to 4.2 m", "1.7 to 16.0 m", "2.0 to 12.5 m", "2.8 to 12.5 m"], answer: 0, page: 141 },
    ],
  },
  {
    slug: "bentonite-system",
    title: "Volume-controlled bentonite lubrication system",
    source: "Pipe Jacking",
    minutes: 20,
    summary:
      "How the automatic bentonite system distributes lubricant along the drive, what it can do, and the first things to check when a pump does not start.",
    reading: [
      { pages: [256, 260], label: "Goals, advantages, user interface" },
      { pages: [261, 276], label: "Classic mode, volume-controlled operation, alignment plan, sensors, parameters" },
      { pages: [277, 278], label: "Troubleshooting tables" },
    ],
    keyPoints: [
      { text: "Goals: understand the operation of the volume-controlled system, use bentonite optimally, and reduce skin friction during propulsion for higher efficiency.", page: 257 },
      { text: "Advantages: automatic volume-controlled distribution along the alignment, adjustable quantities for different ground, up to 4 bentonite pumps controlled simultaneously, complete data storage of volume, pressures and distribution, and an additional pressure sensor in the tunnel bentonite line.", page: 258 },
      { text: "If the bentonite pump fails to start, check in order: gateways activated in the visualisation, bentonite pump control button, tunnel control voltage button, bentonite units connected (Classic mode) or assigned (normal mode), lubrication activated, a unit preselected.", page: 277 },
    ],
    quiz: [
      { q: "How many bentonite pumps can the system control at the same time?", options: ["1", "2", "4", "8"], answer: 2, page: 258 },
      { q: "The bentonite pump fails to start. Which is listed as a possible cause?", options: ["Cutting wheel pressure too low", "Gateways not activated in the visualisation", "Separation plant full", "Interjack not extended"], answer: 1, page: 277 },
      { q: "What is the main purpose of bentonite lubrication during propulsion?", options: ["Cooling the main drive", "Reducing skin friction", "Sealing the exit shaft", "Supporting the tunnel face"], answer: 1, page: 257 },
    ],
  },
  {
    slug: "electricity-basics",
    title: "Electricity basics: voltage, current and resistance",
    source: "Electrical Training",
    minutes: 15,
    summary:
      "The three quantities every crew member should be able to explain, with the water analogy used in the training, plus the difference between AC and DC.",
    reading: [
      { pages: [5, 9], label: "Voltage, current, resistance and how they relate" },
      { pages: [10, 12], label: "Direct and alternating current" },
    ],
    keyPoints: [
      { text: "Voltage is the electrical force that pushes current along; it is created by batteries, generators and power plants. Water analogy: voltage is pressure. Measured in volts (V).", page: 6 },
      { text: "Resistance opposes current flow. It rises with a longer conductor and higher temperature, falls with a thicker conductor, and depends on material (rubber high, copper low). Water analogy: pipe narrowness. Measured in ohms.", page: 8 },
      { text: "Voltage is the difference between the charges of two terminals (electrical potential); current I flows when a consumer connects them.", page: 9 },
      { text: "Direct current keeps the same polarity and strength at all times (batteries, power supplies).", page: 10 },
      { text: "Alternating current periodically reverses direction, e.g. the 230 V / 50 Hz socket; at 50 Hz one period lasts 0.02 s, at 60 Hz about 0.016 s; the peak of a 230 V supply is about 325 V.", page: 11 },
    ],
    quiz: [
      { q: "In the water analogy used in the training, voltage corresponds to…", options: ["Flow rate", "Pipe narrowness", "Pressure", "Pipe length"], answer: 2, page: 6 },
      { q: "Which change increases the resistance of a wire?", options: ["Making it thicker", "Making it longer", "Lowering its temperature", "Using copper instead of rubber"], answer: 1, page: 8 },
      { q: "How long is one period of a 50 Hz supply?", options: ["0.002 s", "0.016 s", "0.02 s", "0.2 s"], answer: 2, page: 11 },
    ],
  },
  {
    slug: "electrical-safety",
    title: "Electrical hazards, the human body and the 5 safety rules",
    source: "Electrical Training",
    minutes: 25,
    summary:
      "The safety core of the electrical deck: how to spot hazards, what current does to the body, what non-electricians may and may not do, and the five rules before touching any circuit.",
    reading: [
      { pages: [15, 24], label: "What an electrical hazard is, how to recognise and evaluate it, protection" },
      { pages: [25, 28], label: "Effects on the human body, burns" },
      { pages: [29, 30], label: "Who may do what, and the 5 safety rules" },
    ],
    keyPoints: [
      { text: "Electrical hazards often result from poorly maintained equipment, faulty wiring and improper handling.", page: 15 },
      { text: "Recognise hazards: damaged insulation, cracked outlets, loose connections, burn marks; tripped breakers or blown fuses and overheated panels (overload); missing grounding; water or moisture near electrical systems; wrong PPE or tools.", page: 17 },
      { text: "Most accidents come from unsafe equipment or installation, an unsafe environment, or unsafe work practices; prevention uses insulation, guarding, grounding, electrical protective devices and safe work practices.", page: 24 },
      { text: "Release limit for 50 to 60 Hz AC: from 6 mA for women and 9 mA for men. Ventricular fibrillation from 50 mA. From 500 mA the effect is always fatal. Direct current is just as dangerous as alternating current.", page: 25 },
      { text: "Non-electricians may work up to 50 V AC or 120 V DC and connect pluggable equipment. Above that only a qualified electrician. Not allowed: connecting a container to the grid or generator, connecting non-pluggable consumers, repairing cables, replacing three-phase parts or fuses.", page: 29 },
      { text: "The 5 safety rules: 1 switch off, 2 secure against re-energisation (lockable cover, LOTO padlocks, tags), 3 verify voltage-free state (three-point check), 4 discharge, ground and short-circuit (earth first, then short), 5 protect against nearby live parts (insulating mats, barriers).", page: 30 },
    ],
    quiz: [
      { q: "From what current is ventricular fibrillation expected (50 to 60 Hz AC)?", options: ["6 mA", "9 mA", "50 mA", "500 mA"], answer: 2, page: 25 },
      { q: "Up to what nominal voltage may a non-electrician work?", options: ["24 V AC or 48 V DC", "50 V AC or 120 V DC", "230 V AC or 400 V DC", "400 V AC only"], answer: 1, page: 29 },
      { q: "What is safety rule number 3?", options: ["Switch off", "Secure against re-energisation", "Verify for voltage-free state", "Discharge, ground and short-circuit"], answer: 2, page: 30 },
      { q: "How is the voltage-free state verified?", options: ["By reading the panel label", "With a three-point check: prove the tester live, test the circuit, re-test live", "By waiting five minutes after switching off", "By asking the operator"], answer: 1, page: 30 },
    ],
  },
  {
    slug: "reading-schematics",
    title: "Reading electrical schematics",
    source: "Electrical Training",
    minutes: 20,
    summary:
      "How Herrenknecht wiring diagrams are organised, what the title block tells you, and the letter codes and symbols used for components.",
    reading: [
      { pages: [33, 41], label: "What a wiring diagram is, title block, table of contents, structure identifiers" },
      { pages: [42, 53], label: "Diagram pages, network settings, I/O module overviews" },
      { pages: [54, 58], label: "Electric panel, IEC symbols, equipment category legends" },
    ],
    keyPoints: [
      { text: "A wiring diagram shows the components of a system and how they interact, gives a clear view of the circuit and current flow, and is used to explain functional relations and for troubleshooting.", page: 33 },
      { text: "The title block carries the drawing number, job number, project name (e.g. M-3058C) and machine type (e.g. C40).", page: 34 },
      { text: "The diagram set starts with a table of contents and a structure identifier overview that maps locations and functions.", page: 39 },
      { text: "Equipment category letters A to M: assemblies, converters from non-electrical values (e.g. pressure sensors), capacitors, PLC and binary elements, various, safeguards (fuses, motor circuit switches), generators and power supplies, signalling equipment, relays and contactors, coils, motors.", page: 56 },
      { text: "Letters N to Z: amplifiers and controllers, measuring and display equipment, heavy-current switchgear (main switch), resistors, switches and pushbuttons, transformers, electrical converters, valves and semiconductors, terminals and connectors, electrically actuated mechanical equipment, terminators and filters.", page: 57 },
    ],
    quiz: [
      { q: "What is a wiring diagram used for, according to the training?", options: ["Ordering spare parts only", "Explaining electrical functional relations and troubleshooting", "Recording maintenance intervals", "Planning the jobsite layout"], answer: 1, page: 33 },
      { q: "Which category holds fuses and motor circuit switches?", options: ["Safeguards", "Signalling equipment", "Transformers", "Terminals"], answer: 0, page: 56 },
      { q: "Which of these appears in the drawing title block?", options: ["Bentonite mixture", "Machine type", "Oil sampling interval", "Jacking force"], answer: 1, page: 34 },
    ],
  },
  {
    slug: "plc-basics",
    title: "PLC basics",
    source: "Electrical Training",
    minutes: 20,
    summary:
      "What a programmable logic controller does on a TBM, how it senses and acts, and the normally-open versus normally-closed distinction that trips up beginners.",
    reading: [
      { pages: [66, 71], label: "What a PLC is, inputs, outputs, NO and NC contacts" },
      { pages: [73, 78], label: "Number systems, bits, bytes and addressing" },
      { pages: [103, 107], label: "How the program works in a PLC" },
    ],
    keyPoints: [
      { text: "A PLC controls a process; the program is loaded into the PLC's memory and its output is routed to the machine.", page: 66 },
      { text: "Herrenknecht controllers have moved from Simatic S5 (M1C to M-599C) through S7 hardware to S7 software controllers (M-1600C to M-2529C) and TIA Portal.", page: 68 },
      { text: "The PLC learns the state of the process from signal generators wired to its inputs, e.g. sensors, switches and buttons that are closed or open.", page: 69 },
      { text: "The PLC controls the process through actuators wired to its outputs with a control supply of e.g. 24 V: motors on/off, valves extended/retracted, lamps on/off.", page: 70 },
      { text: "A NO (normally open) contact is closed when it is active; a NC (normally closed) contact is closed when it is not active.", page: 71 },
      { text: "Inputs and outputs are grouped in bytes of 8 bits, numbered bit 0 to bit 7; the byte number plus bit number is the address. In Simatic S7 a word is 16 bits.", page: 76 },
      { text: "After power-on the processor reads the inputs into the process-image input table, then processes the program instructions one after another.", page: 103 },
    ],
    quiz: [
      { q: "A normally closed (NC) contact is…", options: ["Closed when active", "Closed when not active", "Always open", "Only used on outputs"], answer: 1, page: 71 },
      { q: "What supplies the PLC with information about the process?", options: ["Actuators on the outputs", "Signal generators such as sensors and switches on the inputs", "The visualisation screen", "The bentonite pump"], answer: 1, page: 69 },
      { q: "How many bits make one byte in PLC addressing?", options: ["4", "8", "16", "32"], answer: 1, page: 76 },
    ],
  },
  {
    slug: "finding-spare-parts",
    title: "Finding a spare part in the drawings and parts lists",
    source: "Drawings & Part Lists",
    minutes: 20,
    summary:
      "The step-by-step route from the general layout drawing to a material number you can order, using the two worked examples in the deck.",
    reading: [
      { pages: [3, 15], label: "Objectives and the proximity switch example" },
      { pages: [16, 24], label: "The disc cutter example and choosing the right version" },
      { pages: [29, 32], label: "Structure of drawings, drawing explanation, parts list" },
    ],
    keyPoints: [
      { text: "Objectives: safe handling of technical documents, fast locating of information, identifying and ordering spare parts.", page: 3 },
      { text: "Procedure: localise the assembly in the general layout drawing, select the assembly drawing, localise the part, select its detail drawing, read the material number from the parts list, then place the order with that material number.", page: 15 },
      { text: "Worked example: the hydraulic gate valve (part number 30041162, drawing 208-07-031-41) lists item 102, proximity switch, material number 26602889, quantity 2.", page: 14 },
      { text: "Disc cutters exist in several versions of the same article (e.g. 29600888), with or without hardfacing, chosen for the geology and operating conditions.", page: 23 },
      { text: "To choose a matching disc cutter, check the pre-assembly of the rock cutterhead, consult Herrenknecht about the correct version, and order with the material number.", page: 24 },
      { text: "The drawing frame carries the drawing type, project, designation, drawing number, article number, date and approval; the modular parts list on page 2 links item numbers to material numbers and quantities.", page: 31 },
    ],
    quiz: [
      { q: "Which number do you use to place the spare part order?", options: ["The item number in the drawing", "The material number from the parts list", "The page number of the drawing", "The project number"], answer: 1, page: 15 },
      { q: "In the worked example, what is the material number of the proximity switch?", options: ["30041162", "27600489", "26602889", "27403645"], answer: 2, page: 14 },
      { q: "What decides which disc cutter version to fit?", options: ["The pipe diameter", "Geology and operating conditions", "The colour of the cutterhead", "The jacking force"], answer: 1, page: 23 },
    ],
  },
  {
    slug: "lubrication-filters-accumulators",
    title: "Grease lubrication, hydraulic filters and accumulators",
    source: "Drawings & Part Lists",
    minutes: 25,
    summary:
      "Three hydraulic subsystems a beginner meets on every machine: the grease pump and progressive distributor, the return suction filter, and nitrogen-charged accumulators.",
    reading: [
      { pages: [47, 57], label: "Grease pump components and pump element" },
      { pages: [58, 66], label: "Grease filter, distributor block function, malfunctions" },
      { pages: [71, 77], label: "Return suction filter" },
      { pages: [81, 85], label: "Bladder and membrane accumulators" },
    ],
    keyPoints: [
      { text: "Grease pump components: tank, pump element, safety valve, filling nozzle for emergency lubrication, empty-level plug 2A1, pump filling nozzle, control card, plug 1A1, return connection.", page: 48 },
      { text: "The pump element works with an eccentric giving a constant quantity: piston, return spring and non-return valve; adjustable elements set the delivery with a regulating spindle and counter nut.", page: 49 },
      { text: "The progressive distributor moves pistons A, B, C and D one after another, each opening the canal to the next, so lubricant leaves outlets in a fixed order; one full cycle then repeats.", page: 60 },
      { text: "A documented malfunction cause is grease contamination from poor quality gloves.", page: 66 },
      { text: "Bladder accumulator: the bladder is pre-filled with nitrogen; at minimum operating pressure about 10 % of the volume should remain as liquid so the bladder does not hit the valve; usable volume is the difference between the maximum and minimum pressure positions.", page: 83 },
      { text: "Maintenance work on accumulators must be carried out by qualified staff only.", page: 81 },
    ],
    quiz: [
      { q: "What gas is the accumulator bladder pre-filled with?", options: ["Compressed air", "Nitrogen", "Oxygen", "Carbon dioxide"], answer: 1, page: 83 },
      { q: "Who may carry out maintenance work on accumulators?", options: ["Any crew member", "The machine operator", "Qualified staff only", "The pipe supplier"], answer: 2, page: 81 },
      { q: "Which contamination source for grease is named in the training?", options: ["Bentonite", "Poor quality gloves", "Sea water", "Cutting oil"], answer: 1, page: 66 },
    ],
  },
  {
    slug: "maintenance-basics",
    title: "Maintenance basics",
    source: "Drawings & Part Lists",
    minutes: 25,
    summary:
      "Why maintenance matters, the safety rules before any maintenance job, and the intervals for oil, filters and cutterhead checks.",
    reading: [
      { pages: [89, 93], label: "Why maintain, introduction, safety rules, maintenance schedule" },
      { pages: [94, 111], label: "Oil sampling, laboratory report, oil change, filter change" },
      { pages: [119, 129], label: "Safety instructions, cutterhead and crusher inspection, HP water pumps" },
    ],
    keyPoints: [
      { text: "Reasons for pump failures: maintenance 80 %, installation 12 %, manufacturing 6 %, the rest design.", page: 89 },
      { text: "Safety rules: wear PPE; switch off the machine and make sure it cannot be switched back on; depressurise the system; cleanliness (plug connections, remove dust and dirt, do not interrupt assembly); environmental protection (avoid oil spills, use containers or spill kits).", page: 91 },
      { text: "Hydraulic oil: every 500 operating hours or after a long standstill have the oil analysed by an external laboratory; take the sample only at operating temperature and at the intended sampling point.", page: 92 },
      { text: "Change filters when changing the oil, after a long standstill, or when the differential pressure switch or visual indicator triggers; the indicator is only reliable above 40 °C oil temperature. Filters: return suction, high-pressure, low-pressure, magnetic.", page: 109 },
      { text: "Only do repair and maintenance at standstill: secure the main switch with a padlock, depressurise the hydraulic system, disconnect electrical cables.", page: 120 },
      { text: "After each deployment inspect the cutterhead structure for wear and cracks, and the disc cutters for worn hardfacing, screw connections and cracks; check tightening torques.", page: 123 },
      { text: "HP water pumps: after the first 50 operating hours change the gearbox oil in the high-pressure unit and the water filters; then every 500 hours or 6 months.", page: 129 },
    ],
    quiz: [
      { q: "What share of pump failures does the training attribute to maintenance?", options: ["6 %", "12 %", "50 %", "80 %"], answer: 3, page: 89 },
      { q: "How often should hydraulic oil be analysed by a laboratory?", options: ["Every 50 hours", "Every 500 operating hours or after a long standstill", "Once a year only", "Only when the filter indicator triggers"], answer: 1, page: 92 },
      { q: "Above what oil temperature is the filter indicator reliable?", options: ["20 °C", "40 °C", "60 °C", "80 °C"], answer: 1, page: 109 },
    ],
  },
];

export function moduleBySlug(slug: string) {
  return BEGINNER_TRACK.find((m) => m.slug === slug);
}

export const TRACK_MINUTES = BEGINNER_TRACK.reduce((n, m) => n + m.minutes, 0);
