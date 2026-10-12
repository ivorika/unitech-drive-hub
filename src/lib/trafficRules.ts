export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index of correct option
}

export interface TrafficModule {
  id: string;
  title: string;
  summary: string;
  points: string[];
  quiz: QuizQuestion[];
}

export const PASS_MARK = 0.7;

export const TRAFFIC_MODULES: TrafficModule[] = [
  {
    id: "road-signs",
    title: "Road Signs",
    summary: "Understand the three main kinds of road signs and what their shapes and colours mean.",
    points: [
      "Red circles give orders you must obey (e.g. speed limits, no entry).",
      "Red triangles warn you of hazards ahead (e.g. bends, pedestrian crossings).",
      "Blue circles tell you what you must do (e.g. keep left, turn left).",
      "A red octagon STOP sign means come to a complete stop at the line.",
      "An upside-down triangle means GIVE WAY to traffic on the road you are entering.",
    ],
    quiz: [
      { question: "What does a red triangle sign usually mean?", options: ["An order", "A warning of a hazard", "Information only", "Parking area"], answer: 1 },
      { question: "At a STOP sign you must:", options: ["Slow down", "Stop only if cars are coming", "Come to a complete stop", "Sound your horn"], answer: 2 },
      { question: "An upside-down triangle sign means:", options: ["Give way", "No entry", "Roundabout ahead", "One way"], answer: 0 },
    ],
  },
  {
    id: "traffic-lights",
    title: "Traffic Lights & Signals",
    summary: "Know what each light means and how to respond safely.",
    points: [
      "Red means stop behind the line and wait.",
      "Amber (yellow) means stop, unless you are so close that stopping would be unsafe.",
      "Green means go if the way is clear — still check for pedestrians.",
      "A flashing amber means proceed with caution and give way to pedestrians.",
      "Always use your indicators at least 3 seconds before turning or changing lanes.",
    ],
    quiz: [
      { question: "When the light turns amber you should:", options: ["Speed up", "Stop if it is safe to do so", "Sound the horn", "Change lanes"], answer: 1 },
      { question: "A green light means:", options: ["Go without looking", "Go if the way is clear", "Stop", "Turn only"], answer: 1 },
      { question: "How long before turning should you indicate?", options: ["Never", "As you turn", "At least 3 seconds", "Only at night"], answer: 2 },
    ],
  },
  {
    id: "right-of-way",
    title: "Right of Way & Intersections",
    summary: "Learn who goes first at intersections, roundabouts and crossings.",
    points: [
      "Give way to pedestrians at marked crossings.",
      "At roundabouts, give way to vehicles already on the roundabout.",
      "At uncontrolled intersections, give way to vehicles on your right.",
      "Give way to emergency vehicles with sirens or flashing lights — pull over safely.",
      "Never enter an intersection unless you can clear it.",
    ],
    quiz: [
      { question: "At a roundabout you give way to:", options: ["Vehicles entering after you", "Vehicles already on the roundabout", "Nobody", "Only trucks"], answer: 1 },
      { question: "An ambulance with sirens approaches. You should:", options: ["Keep driving", "Speed up", "Pull over safely and let it pass", "Stop in the middle of the road"], answer: 2 },
      { question: "At a marked pedestrian crossing you must:", options: ["Give way to pedestrians", "Hoot to warn them", "Drive around them", "Flash your lights"], answer: 0 },
    ],
  },
  {
    id: "speed-safety",
    title: "Speed Limits & Safe Driving",
    summary: "Drive at safe speeds, keep distance and stay alert.",
    points: [
      "Always obey posted speed limits; slow down further in rain, fog or heavy traffic.",
      "Keep at least a 3-second gap behind the vehicle in front.",
      "Everyone in the vehicle must wear a seatbelt.",
      "Never drive under the influence of alcohol or drugs.",
      "Do not use a mobile phone while driving.",
    ],
    quiz: [
      { question: "The safe following distance in good conditions is at least:", options: ["1 second", "3 seconds", "10 metres", "Half a car length"], answer: 1 },
      { question: "Who must wear a seatbelt?", options: ["Only the driver", "Only front passengers", "Everyone in the vehicle", "Nobody in town"], answer: 2 },
      { question: "In heavy rain you should:", options: ["Drive at the speed limit", "Slow down below the limit", "Turn on hazard lights and speed up", "Follow closely"], answer: 1 },
    ],
  },
  {
    id: "parking-overtaking",
    title: "Parking & Overtaking",
    summary: "Park legally and overtake only when it is safe.",
    points: [
      "Do not park on footpaths, near intersections, or in front of driveways.",
      "Never overtake on a solid centre line, a bend, or near the top of a hill.",
      "Check mirrors and blind spot before overtaking, then indicate.",
      "Return to your lane only when you can see the overtaken vehicle in your mirror.",
      "Do not overtake at pedestrian crossings.",
    ],
    quiz: [
      { question: "You may NOT overtake:", options: ["On a straight road with a broken line", "On a solid centre line", "When the road is clear", "On a highway"], answer: 1 },
      { question: "Before overtaking you should first:", options: ["Hoot", "Check mirrors and blind spot", "Speed up", "Flash lights"], answer: 1 },
      { question: "Which is a legal place to park?", options: ["On a footpath", "Across a driveway", "In a marked parking bay", "On a pedestrian crossing"], answer: 2 },
    ],
  },
];
