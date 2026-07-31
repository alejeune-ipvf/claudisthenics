// Claudisthenics — program data + exercise poses (v0.2 program)
// Poses: side view, canvas 340x240, ground at y=212.
// Joints: ankle knee hip shoulder elbow wrist head (+ knee2/ankle2, elbow2/wrist2)

const POSES = {
  l0_hang: {
    period: 2200,
    props: [{t:"line", x1:110, y1:30, x2:230, y2:30}],
    poses: [
      {wrist:[170,34], elbow:[170,68], shoulder:[170,104], hip:[174,152], knee:[168,182], ankle:[176,206], head:[186,96]},
      {wrist:[170,34], elbow:[170,64], shoulder:[170,92],  hip:[174,140], knee:[168,170], ankle:[176,194], head:[186,84]} ] },
  l0_row: {
    props: [{t:"line", x1:210, y1:20, x2:210, y2:78}, {t:"circ", cx:210, cy:84, r:6}],
    poses: [
      {ankle:[160,208], knee:[158,176], hip:[150,146], shoulder:[140,96],  head:[136,80],  elbow:[172,92],  wrist:[204,86]},
      {ankle:[160,208], knee:[160,176], hip:[158,146], shoulder:[168,90],  head:[166,74],  elbow:[188,112], wrist:[204,86]} ] },
  l0_pushup: {
    props: [{t:"rect", x:205, y:140, w:70, h:72}],
    poses: [
      {ankle:[62,208], knee:[102,180], hip:[140,153], shoulder:[200,112], head:[222,100], elbow:[206,126], wrist:[212,140]},
      {ankle:[62,208], knee:[102,187], hip:[142,167], shoulder:[207,133], head:[230,124], elbow:[228,138], wrist:[212,140]} ] },
  l0_support: {
    hold: true,
    props: [{t:"line", x1:190, y1:180, x2:190, y2:212}, {t:"line", x1:172, y1:180, x2:208, y2:180}],
    poses: [
      {wrist:[190,180], elbow:[190,152], shoulder:[190,124], head:[195,106], hip:[191,170], knee:[176,196], ankle:[184,209]} ] },
  l0_squat: {
    props: [{t:"line", x1:250, y1:118, x2:250, y2:212}, {t:"line", x1:250, y1:165, x2:295, y2:165}, {t:"line", x1:295, y1:165, x2:295, y2:212}],
    poses: [
      {ankle:[160,208], knee:[158,172], hip:[155,134], shoulder:[158,92],  head:[160,76],  elbow:[200,110], wrist:[248,122]},
      {ankle:[160,208], knee:[178,178], hip:[142,172], shoulder:[150,128], head:[152,112], elbow:[198,132], wrist:[248,122]} ] },
  l0_bridge: {
    poses: [
      {ankle:[200,208], knee:[178,172], hip:[140,206], shoulder:[80,206], head:[56,200], elbow:[105,208], wrist:[128,208]},
      {ankle:[200,208], knee:[180,166], hip:[145,170], shoulder:[80,206], head:[56,200], elbow:[105,208], wrist:[128,208]} ] },
  l0_plank: {
    hold: true,
    poses: [
      {ankle:[60,198], knee:[108,192], hip:[152,182], shoulder:[212,170], head:[238,160], elbow:[210,200], wrist:[240,202]} ] },
  l0_sideplank: {
    hold: true,
    poses: [
      {ankle:[70,202], knee:[112,190], hip:[150,180], shoulder:[210,162], head:[236,152], elbow:[208,202], wrist:[238,204], elbow2:[216,128], wrist2:[222,100]} ] },
  l0_backext: {
    poses: [
      {ankle:[90,206], knee:[130,206], hip:[170,206], shoulder:[225,202], head:[250,196], elbow:[238,198], wrist:[246,190]},
      {ankle:[90,206], knee:[130,206], hip:[170,204], shoulder:[222,182], head:[248,168], elbow:[232,176], wrist:[242,168]} ] },
  l1_bandpull: {
    period: 2600,
    props: [{t:"line", x1:110, y1:30, x2:230, y2:30}],
    band: {anchor:[170,30], joint:"knee"},
    poses: [
      {wrist:[170,34], elbow:[172,66], shoulder:[170,100], hip:[172,148], knee:[165,175], ankle:[155,198], head:[186,92]},
      {wrist:[170,34], elbow:[192,50], shoulder:[172,58],  hip:[174,110], knee:[167,140], ankle:[157,165], head:[186,36]} ] },
  l1_row45: {
    props: [{t:"line", x1:210, y1:20, x2:210, y2:100}, {t:"circ", cx:210, cy:106, r:6}],
    poses: [
      {ankle:[180,208], knee:[163,186], hip:[146,166], shoulder:[115,128], head:[110,112], elbow:[160,116], wrist:[204,108]},
      {ankle:[180,208], knee:[172,184], hip:[165,160], shoulder:[152,110], head:[148,94],  elbow:[180,128], wrist:[204,108]} ] },
  l1_pushup: {
    props: [{t:"rect", x:205, y:172, w:70, h:40}],
    poses: [
      {ankle:[52,208], knee:[98,189], hip:[140,172], shoulder:[202,146], head:[224,134], elbow:[206,158], wrist:[212,170]},
      {ankle:[52,208], knee:[98,194], hip:[140,182], shoulder:[205,162], head:[228,152], elbow:[228,168], wrist:[212,170]} ] },
  l1_negdip: {
    period: 3500,
    props: [{t:"line", x1:190, y1:150, x2:190, y2:212}, {t:"line", x1:172, y1:150, x2:208, y2:150}],
    poses: [
      {wrist:[190,150], elbow:[190,124], shoulder:[190,96],  head:[195,80],  hip:[192,144], knee:[176,176], ankle:[184,200]},
      {wrist:[190,150], elbow:[212,142], shoulder:[190,134], head:[195,118], hip:[192,180], knee:[172,196], ankle:[182,206]} ] },
  l1_squat: {
    poses: [
      {ankle:[170,208], knee:[168,172], hip:[165,134], shoulder:[168,90],  head:[170,74],  elbow:[182,108], wrist:[192,122]},
      {ankle:[170,208], knee:[190,180], hip:[150,182], shoulder:[160,140], head:[163,124], elbow:[188,142], wrist:[216,138]} ] },
  l1_slbridge: {
    poses: [
      {ankle:[200,208], knee:[178,172], hip:[140,206], shoulder:[80,206], head:[56,200], elbow:[105,208], wrist:[128,208], knee2:[180,180], ankle2:[215,155]},
      {ankle:[200,208], knee:[180,166], hip:[145,170], shoulder:[80,206], head:[56,200], elbow:[105,208], wrist:[128,208], knee2:[195,140], ankle2:[228,122]} ] },
  l1_hollow: {
    hold: true,
    poses: [
      {ankle:[208,182], knee:[182,168], hip:[150,202], shoulder:[100,182], head:[76,168], elbow:[122,172], wrist:[146,162]} ] },
};

const PROGRAM = {
  version: "0.2",
  tracks: ["pull_vertical", "row", "push", "dip", "squat", "hinge"],
  trackLabels: {
    pull_vertical: "Pull-up", row: "Row", push: "Push-up",
    dip: "Dip", squat: "Squat", hinge: "Hinge"
  },
  pairs: [["pull_vertical", "squat"], ["dip", "hinge"], ["row", "push"]],
  workSets: 3,
  restSeconds: 90,
  coreRounds: 3,
  coreRestSeconds: 60,
  warmup: [
    "Joint circles: neck, shoulders, wrists, hips, knees, ankles",
    "Band shoulder dislocates × 10",
    "Scapular pulls × 5 (hang or standing with band)",
    "Easy squats × 10",
    "Wrist prep: palm rocks front/back"
  ],
  levels: [
    { id: 0, name: "Réveil", minWeeks: 3, playable: true,
      exercises: {
        pull_vertical: {viz:"l0_hang",    name:"Dead hang + scap pulls",   type:"hold", target:[20,45], cue:"Hang relaxed, then 3×5 scap pulls: arms straight, shoulders do the work"},
        row:           {viz:"l0_row",     name:"Vertical row",             type:"reps", target:[5,8],   cue:"Body ~30° from upright, pull chest to hands"},
        push:          {viz:"l0_pushup",  name:"Incline push-up (table)",  type:"reps", target:[5,8],   cue:"Body straight, chest to the edge"},
        dip:           {viz:"l0_support", name:"Support hold",             type:"hold", target:[15,30], cue:"Arms locked, shoulders down, no shrugging"},
        squat:         {viz:"l0_squat",   name:"Chair-assisted squat",     type:"reps", target:[5,8],   cue:"Light hand support, sit back and down"},
        hinge:         {viz:"l0_bridge",  name:"Glute bridge",             type:"reps", target:[8,12],  cue:"Squeeze at the top, straight line knee-hip-shoulder"}
      },
      core: [
        {id:"core_plank",     viz:"l0_plank",     name:"Plank",          type:"hold",      target:[20,30], cue:"Straight line, no sagging hips"},
        {id:"core_sideplank", viz:"l0_sideplank", name:"Side plank",     type:"side_hold", target:[15,20], cue:"Hips stacked and lifted — log the weaker side"},
        {id:"core_backext",   viz:"l0_backext",   name:"Back extension", type:"reps",      target:[8,12],  cue:"Lift chest slowly, look down"}
      ]},
    { id: 1, name: "Fondations", playable: true,
      exercises: {
        pull_vertical: {viz:"l1_bandpull", name:"Band-assisted pull-up (green)", type:"reps", target:[5,8], cue:"Band over the bar, knee in the loop, chin over bar"},
        row:           {viz:"l1_row45",    name:"Incline row (~45°)",            type:"reps", target:[5,8], cue:"Lower the rings to steepen the angle"},
        push:          {viz:"l1_pushup",   name:"Low-incline push-up (chair)",   type:"reps", target:[5,8], cue:"Same standard, lower support"},
        dip:           {viz:"l1_negdip",   name:"Negative dip (5 s descent)",    type:"reps", target:[3,5], cue:"Jump/step to the top, lower as slowly as you can"},
        squat:         {viz:"l1_squat",    name:"Full bodyweight squat",         type:"reps", target:[5,8], cue:"Heels down, hips below parallel, arms out for balance"},
        hinge:         {viz:"l1_slbridge", name:"Single-leg glute bridge",       type:"side_reps", target:[5,8], cue:"Free leg extended, hips stay level — log the weaker side"}
      },
      core: [
        {id:"core_hollow",    viz:"l1_hollow",    name:"Hollow tuck hold", type:"hold",      target:[15,25], cue:"Lower back pressed to the floor, shoulders off it"},
        {id:"core_sideplank", viz:"l0_sideplank", name:"Side plank",       type:"side_hold", target:[20,30], cue:"Hips stacked and lifted — log the weaker side"},
        {id:"core_backext",   viz:"l0_backext",   name:"Back extension",   type:"reps",      target:[8,12],  cue:"Lift chest slowly, look down"}
      ]},
    { id: 2, name: "Construction", playable: false,
      summary: ["Band pull-up (blue)", "Horizontal row", "Full push-up", "Band-assisted dip", "Split squat", "Banded RDL"] },
    { id: 3, name: "Première Traction", playable: false,
      summary: ["Strict pull-up", "Wide row", "Diamond push-up", "Parallel bar dip", "Bulgarian split squat", "Nordic negative"] },
    { id: 4, name: "Consolidation", playable: false,
      summary: ["L-sit pull-up", "Archer row", "Pseudo-planche push-up", "Ring dip", "Deep step-up", "Slow nordic negative"] },
    { id: 5, name: "Envol", playable: false,
      summary: ["Archer pull-up", "One-arm row progression", "Ring push-up", "Ring dip RTO", "Pistol progression", "Band-assisted nordic"] },
    { id: 6, name: "Spécialisation", playable: false,
      summary: ["Muscle-up", "Handstand push-up", "Pistol squat", "Front lever", "One-arm pull-up"] }
  ]
};
