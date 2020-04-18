//global game variables
let body = []; //non static bodies
let map = []; //all static bodies
let cons = []; //all constraints between a point and a body
let consBB = []; //all constraints between two bodies
//main object for spawning levels
const level = {
  maxJump: 390,
  defaultZoom: 1400,
  boostScale: 0.000023,
  levels: ["skyscrapers", "rooftops", "warehouse", "highrise", "office", "aerie", "satellite"],
  onLevel: 0,
  levelsCleared: 0,
  start() {
    if (build.isURLBuild && level.levelsCleared === 0) build.onLoadPowerUps();
    if (level.levelsCleared === 0) { //this code only runs on the first level
      // level.difficultyIncrease(9)
      // b.giveGuns("rail gun")
      // mech.setField("pilot wave")
      // b.giveMod("nonlocality");

      level.intro(); //starting level
      // level.testing();
      // level.stronghold()
      // level.bosses();
      // level.satellite();
      // level.skyscrapers();
      // level.aerie();
      // level.rooftops();
      // level.warehouse();
      // level.highrise();
      // level.office();
    } else {
      spawn.setSpawnList(); //picks a couple mobs types for a themed random mob spawns
      // spawn.pickList = ["focuser", "focuser"]
      level[level.levels[level.onLevel]](); //picks the current map from the the levels array
    }

    level.levelAnnounce();
    game.noCameraScroll();
    game.setZoom();
    level.addToWorld(); //add bodies to game engine
    game.draw.setPaths();
    for (let i = 0; i < b.modLaserBotCount; i++) {
      b.laserBot()
    }
    for (let i = 0; i < b.modNailBotCount; i++) {
      b.nailBot()
    }
  },
  isBuildRun: false,
  difficultyIncrease(num = 1) {
    // if (level.isBuildRun) num++
    for (let i = 0; i < num; i++) {
      game.difficulty++
      game.dmgScale += 0.17; //damage done by mobs increases each level
      b.dmgScale *= 0.91; //damage done by player decreases each level
      game.accelScale *= 1.02 //mob acceleration increases each level
      game.lookFreqScale *= 0.98 //mob cycles between looks decreases each level
      game.CDScale *= 0.97 //mob CD time decreases each level
    }
    game.healScale = 1 / (1 + game.difficulty * 0.09) //a higher denominator makes for lower heals // mech.health += heal * game.healScale;
  },
  difficultyDecrease(num = 1) { //used in easy mode for game.reset()
    for (let i = 0; i < num; i++) {
      game.difficulty--
      game.dmgScale -= 0.17; //damage done by mobs increases each level
      if (game.dmgScale < 0.1) game.dmgScale = 0.1;
      b.dmgScale /= 0.91; //damage done by player decreases each level
      game.accelScale /= 1.02 //mob acceleration increases each level
      game.lookFreqScale /= 0.98 //mob cycles between looks decreases each level
      game.CDScale /= 0.97 //mob CD time decreases each level
    }
    if (game.difficulty < 1) game.difficulty = 0;
    game.healScale = 1 / (1 + game.difficulty * 0.09)
  },
  difficultyText(mode = document.getElementById("difficulty-select").value) {
    if (mode === "0") {
      return "easy"
    } else if (mode === "1") {
      return "normal"
    } else if (mode === "2") {
      return "hard"
    } else if (mode === "4") {
      return "why"
    }
  },
  levelAnnounce() {
    if (level.levelsCleared === 0) {
      document.title = "n-gon: intro (" + level.difficultyText() + ")";
    } else {
      document.title = "n-gon: L" + (level.levelsCleared) + " " + level.levels[level.onLevel] + " (" + level.difficultyText() + ")";
    }
  },
  //******************************************************************************************************************
  //******************************************************************************************************************

  testing() {
    level.difficultyIncrease(9);
    spawn.setSpawnList();
    spawn.setSpawnList();
    level.defaultZoom = 1500
    game.zoomTransition(level.defaultZoom)
    document.body.style.backgroundColor = "#ddd";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    level.fill.push({
      x: 6400,
      y: -550,
      width: 300,
      height: 350,
      color: "rgba(0,255,255,0.1)"
    });

    mech.setPosToSpawn(0, -750); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);
    level.exit.x = 6500;
    level.exit.y = -230;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    spawn.mapRect(-950, 0, 8200, 800); //ground
    spawn.mapRect(-950, -1200, 800, 1400); //left wall
    spawn.mapRect(-950, -1800, 8200, 800); //roof
    spawn.mapRect(-250, -700, 1000, 900); // shelf
    spawn.mapRect(-250, -1200, 1000, 250); // shelf roof
    powerUps.spawnStartingPowerUps(600, -800);

    function blockDoor(x, y, blockSize = 58) {
      spawn.mapRect(x, y - 290, 40, 60); // door lip
      spawn.mapRect(x, y, 40, 50); // door lip
      for (let i = 0; i < 4; ++i) {
        spawn.bodyRect(x + 5, y - 260 + i * blockSize, 30, blockSize);
      }
    }
    blockDoor(710, -710);
    spawn.mapRect(2500, -1200, 200, 750); //right wall
    blockDoor(2585, -210)
    spawn.mapRect(2500, -200, 200, 300); //right wall
    spawn.mapRect(4500, -1200, 200, 650); //right wall
    blockDoor(4585, -310)
    spawn.mapRect(4500, -300, 200, 400); //right wall
    spawn.mapRect(6400, -1200, 400, 750); //right wall
    spawn.mapRect(6400, -200, 400, 300); //right wall
    spawn.mapRect(6700, -1800, 800, 2600); //right wall
    spawn.mapRect(level.exit.x, level.exit.y + 20, 100, 100); //exit bump

    // spawn.bomberBoss(2900, -500)
    spawn.hopper(1200, -500)
    spawn.hopper(1200, -500)
    // spawn.timeSkipBoss(2900, -500)
    // spawn.randomMob(1600, -500)

  },
  bosses() {
    level.defaultZoom = 1500
    game.zoomTransition(level.defaultZoom)

    // spawn.setSpawnList();
    // spawn.setSpawnList();
    // game.difficulty = 7; //for testing to simulate all possible mobs spawns
    // for (let i = 0; i < game.difficulty; i++) {
    //   game.dmgScale += 0.4; //damage done by mobs increases each level
    //   b.dmgScale *= 0.9; //damage done by player decreases each level
    // }

    document.body.style.backgroundColor = "#ddd";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    // level.fillBG.push({
    //   x: -150,
    //   y: -1150,
    //   width: 7000,
    //   height: 1200,
    //   color: "#eee"
    // });

    level.fill.push({
      x: 6400,
      y: -550,
      width: 300,
      height: 350,
      color: "rgba(0,255,255,0.1)"
    });

    mech.setPosToSpawn(0, -750); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);

    level.exit.x = 6500;
    level.exit.y = -230;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    spawn.mapRect(-950, 0, 8200, 800); //ground
    spawn.mapRect(-950, -1200, 800, 1400); //left wall
    spawn.mapRect(-950, -1800, 8200, 800); //roof
    spawn.mapRect(-250, -700, 1000, 900); // shelf
    spawn.mapRect(-250, -1200, 1000, 250); // shelf roof
    powerUps.spawnStartingPowerUps(600, -800);

    spawn.blockDoor(710, -710);

    spawn[spawn.pickList[0]](1500, -200, 150 + Math.random() * 30);
    spawn.mapRect(2500, -1200, 200, 750); //right wall
    spawn.blockDoor(2585, -210)
    spawn.mapRect(2500, -200, 200, 300); //right wall

    spawn.nodeBoss(3500, -200, spawn.allowedBossList[Math.floor(Math.random() * spawn.allowedBossList.length)]);
    spawn.mapRect(4500, -1200, 200, 750); //right wall
    spawn.blockDoor(4585, -210)
    spawn.mapRect(4500, -200, 200, 300); //right wall

    spawn.lineBoss(5000, -200, spawn.allowedBossList[Math.floor(Math.random() * spawn.allowedBossList.length)]);
    spawn.mapRect(6400, -1200, 400, 750); //right wall
    spawn.mapRect(6400, -200, 400, 300); //right wall
    spawn.mapRect(6700, -1800, 800, 2600); //right wall
    spawn.mapRect(level.exit.x, level.exit.y + 20, 100, 100); //exit bump

    for (let i = 0; i < 3; ++i) {
      if (game.difficulty * Math.random() > 15 * i) {
        spawn.randomBoss(2000 + 500 * (Math.random() - 0.5), -800 + 200 * (Math.random() - 0.5), Infinity);
      }
      if (game.difficulty * Math.random() > 10 * i) {
        spawn.randomBoss(3500 + 500 * (Math.random() - 0.5), -800 + 200 * (Math.random() - 0.5), Infinity);
      }
      if (game.difficulty * Math.random() > 7 * i) {
        spawn.randomBoss(5000 + 500 * (Math.random() - 0.5), -800 + 200 * (Math.random() - 0.5), Infinity);
      }
    }
  },
  intro() {
    // b.giveGuns(0, 1000)
    game.zoomScale = 1000 //1400 is normal
    level.defaultZoom = 1600
    game.zoomTransition(level.defaultZoom, 1)

    mech.setPosToSpawn(460, -100); //normal spawn
    level.enter.x = -1000000; //offscreen
    level.enter.y = -400;
    level.exit.x = 2800;
    level.exit.y = -335;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    spawn.mapRect(level.exit.x, level.exit.y + 25, 100, 100); //exit bump

    document.body.style.backgroundColor = "#eee";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    level.fillBG.push({
      x: 2600,
      y: -600,
      width: 400,
      height: 500,
      color: "#cee"
    });

    level.fill.push({
      x: -150,
      y: -1000,
      width: 2750,
      height: 1000,
      color: "rgba(0,20,40,0.1)"
    });

    const lineColor = "#ddd"
    level.fillBG.push({
      x: 1600,
      y: -500,
      width: 100,
      height: 100,
      color: lineColor
    });

    level.fillBG.push({
      x: -55,
      y: -283,
      width: 12,
      height: 100,
      color: lineColor
    });

    //faster way to draw a wire
    function wallWire(x, y, width, height, front = false) {
      if (front) {
        level.fill.push({
          x: x,
          y: y,
          width: width,
          height: height,
          color: lineColor
        });
      } else {
        level.fillBG.push({
          x: x,
          y: y,
          width: width,
          height: height,
          color: lineColor
        });
      }
    }
    for (let i = 0; i < 3; i++) {
      wallWire(100 - 10 * i, -1050 - 10 * i, 5, 800);
      wallWire(100 - 10 * i, -255 - 10 * i, -300, 5);
    }
    for (let i = 0; i < 5; i++) {
      wallWire(1000 + 10 * i, -1050 - 10 * i, 5, 600);
      wallWire(1000 + 10 * i, -450 - 10 * i, 150, 5);
      wallWire(1150 + 10 * i, -450 - 10 * i, 5, 500);
    }
    for (let i = 0; i < 3; i++) {
      wallWire(2650 - 10 * i, -700 - 10 * i, -300, 5);
      wallWire(2350 - 10 * i, -700 - 10 * i, 5, 800);
    }
    for (let i = 0; i < 5; i++) {
      wallWire(1625 + 10 * i, -1050, 5, 1200);
    }
    for (let i = 0; i < 4; i++) {
      wallWire(1650, -470 + i * 10, 670 - i * 10, 5);
      wallWire(1650 + 670 - i * 10, -470 + i * 10, 5, 600);
    }
    for (let i = 0; i < 3; i++) {
      wallWire(-200 - i * 10, -245 + i * 10, 1340, 5);
      wallWire(1140 - i * 10, -245 + i * 10, 5, 300);
      wallWire(-200 - i * 10, -215 + i * 10, 660, 5);
      wallWire(460 - i * 10, -215 + i * 10, 5, 300);
    }
    spawn.mapRect(-250, 0, 3600, 1800); //ground
    spawn.mapRect(-2750, -2800, 2600, 4600); //left wall
    spawn.mapRect(3000, -2800, 2600, 4600); //right wall
    spawn.mapRect(-250, -2800, 3600, 1800); //roof
    spawn.mapRect(2600, -300, 500, 500); //exit shelf
    spawn.mapRect(2600, -1200, 500, 600); //exit roof
    spawn.mapRect(-95, -1100, 80, 110); //wire source
    spawn.mapRect(410, -10, 90, 20); //small platform for player

    // spawn.bodyRect(-35, -50, 50, 50);
    // spawn.bodyRect(-40, -100, 50, 50);
    // spawn.bodyRect(-45, -150, 60, 50);
    // spawn.bodyRect(-40, -200, 50, 50);
    // spawn.bodyRect(5, -50, 40, 50);
    // spawn.bodyRect(10, -100, 60, 50);
    // spawn.bodyRect(-10, -150, 40, 50);
    // spawn.bodyRect(55, -100, 40, 50);
    // spawn.bodyRect(-150, -300, 100, 100);
    // spawn.bodyRect(-150, -200, 100, 100);
    // spawn.bodyRect(-150, -100, 100, 100);

    // spawn.bodyRect(1790, -50, 40, 50);
    // spawn.bodyRect(1875, -100, 200, 90);
    spawn.bodyRect(2425, -120, 70, 50);
    spawn.bodyRect(2400, -100, 100, 60);
    spawn.bodyRect(2500, -150, 100, 150); //exit step

    mech.health = 0.25;
    mech.displayHealth();
    // powerUps.spawn(-100, 0, "heal", false); //starting gun
    powerUps.spawn(1900, -150, "heal", false); //starting gun
    powerUps.spawn(2050, -150, "heal", false); //starting gun
    // powerUps.spawn(2050, -150, "field", false); //starting gun
    powerUps.spawnStartingPowerUps(2300, -150);

    // powerUps.spawn(2300, -150, "gun", false); //starting gun
    // if (game.isEasyMode) {
    //   // powerUps.spawn(2050, -150, "mod", false); //starting gun
    //   // powerUps.spawn(2050, -150, "mod", false); //starting gun
    //   // powerUps.spawn(-100, -150, "ammo", false); //starting gun
    //   powerUps.spawn(-100, 0, "heal", false); //starting gun
    // }

    spawn.wireFoot();
    spawn.wireFootLeft();
    spawn.wireKnee();
    spawn.wireKneeLeft();
    spawn.wireHead();
    // spawn.mapRect(1400, -700, 50, 300); //ground
    // spawn.healer(1600, -500)
    // spawn.healer(1600, -500)
    // spawn.healer(1900, -500)
    // spawn.healer(1000, -500)
    // spawn.healer(1000, -400)
  },
  satellite() {
    // game.zoomScale = 4500 // remove
    level.defaultZoom = 1700 // 4500 // 1400
    game.zoomTransition(level.defaultZoom)
    mech.setPosToSpawn(-50, -50); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    level.exit.x = -100;
    level.exit.y = -425;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    spawn.mapRect(level.exit.x, level.exit.y + 15, 100, 50); //exit bump


    powerUps.spawnStartingPowerUps(4450, -1400);
    spawn.debris(1000, 20, 1800, 3); //16 debris per level //but less here because a few mobs die from laser
    spawn.debris(4830, -1330, 850, 3); //16 debris per level
    spawn.debris(3035, -3900, 1500, 3); //16 debris per level

    document.body.style.backgroundColor = "#dbdcde";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    //spawn start building
    spawn.mapRect(-300, -800, 50, 800);
    spawn.mapRect(-100, -20, 100, 30);
    spawn.mapRect(-300, -10, 500, 50);
    spawn.mapRect(150, -510, 50, 365);
    spawn.bodyRect(170, -130, 14, 145, 1, spawn.propsFriction); //door to starting room
    spawn.mapRect(-300, 0, 1000, 300); //ground
    spawn.mapRect(-300, 250, 6300, 300); //deeper ground
    spawn.bodyRect(2100, 50, 80, 80);
    spawn.bodyRect(2000, 50, 60, 60);
    // spawn.bodyRect(1650, 50, 300, 200);
    spawn.bodyRect(3175, -155, 325, 325);
    spawn.mapRect(1800, 175, 800, 100); //stops above body from moving to right

    //exit building
    // spawn.mapRect(-100, -410, 100, 30);
    spawn.mapRect(-300, -800, 500, 50);
    spawn.mapRect(150, -800, 50, 110);
    spawn.bodyRect(170, -690, 14, 175, 1, spawn.propsFriction); //door to exit room
    spawn.mapRect(-300, -400, 500, 100); //far left starting ceiling
    level.fill.push({
      x: -250,
      y: -400,
      width: 1800,
      height: 775,
      color: "rgba(0,20,40,0.2)"
    });
    level.fill.push({
      x: 1800,
      y: -475,
      width: 850,
      height: 775,
      color: "rgba(0,20,40,0.2)"
    });
    level.fillBG.push({
      x: -250,
      y: -750,
      width: 420,
      height: 450,
      color: "#d4f4f4"
    });

    //tall platform above exit
    spawn.mapRect(-500, -1900, 400, 50); //super high shade
    spawn.mapRect(0, -1900, 400, 50); //super high shade
    spawn.mapRect(-150, -1350, 200, 25); //super high shade
    spawn.bodyRect(140, -2100, 150, 200); //shield from laser

    level.fillBG.push({
      x: -300,
      y: -1900,
      width: 500,
      height: 1100,
      color: "#d0d4d6"
    });
    //tall platform
    spawn.mapVertex(1125, -450, "325 0  250 80  -250 80  -325 0  -250 -80  250 -80"); //base
    spawn.mapRect(150, -500, 1400, 100); //far left starting ceiling
    spawn.mapRect(625, -2450, 1000, 50); //super high shade
    spawn.bodyRect(1300, -3600, 150, 150); //shield from laser
    level.fillBG.push({
      x: 900,
      y: -2450,
      width: 450,
      height: 2050,
      color: "#d0d4d6"
    });
    //tall platform
    spawn.mapVertex(2225, -450, "325 0  250 80  -250 80  -325 0  -250 -80  250 -80"); //base
    spawn.mapRect(1725, -2800, 1000, 50); //super high shade
    spawn.mapRect(1800, -500, 850, 100); //far left starting ceiling
    spawn.bodyRect(2400, -2950, 150, 150); //shield from laser
    level.fillBG.push({
      x: 2000,
      y: -2800,
      width: 450,
      height: 2300,
      color: "#d0d4d6"
    });
    //tall platform
    spawn.mapVertex(3350, 250, "325 0  250 80  -250 80  -325 0  -250 -80  250 -80"); //base
    spawn.mapRect(2850, -3150, 1000, 50); //super high shade
    spawn.bodyRect(3675, -3470, 525, 20); //plank
    spawn.bodyRect(3600, -3450, 200, 300); //plank support block
    level.fillBG.push({
      x: 3125,
      y: -3100,
      width: 450,
      height: 3300,
      color: "#d0d4d6"
    });

    //far right structure
    spawn.mapRect(5200, -775, 100, 920);
    spawn.mapRect(5300, -1075, 350, 1220);
    spawn.boost(5825, 235, 1400);
    level.fill.push({
      x: 5200,
      y: 125,
      width: 450,
      height: 200,
      color: "rgba(0,20,40,0.25)"
    });

    //structure bellow tall stairs
    level.fill.push({
      x: 4000,
      y: -1200,
      width: 1050,
      height: 1500,
      color: "rgba(0,20,40,0.13)"
    });
    spawn.mapRect(4000, -400, 325, 50);
    spawn.mapRect(4725, -400, 325, 50);
    spawn.mapRect(4000, -1300, 1050, 100);

    //steep stairs
    spawn.mapRect(4100, -1700, 100, 100);
    spawn.mapRect(4200, -2050, 100, 450);
    spawn.mapRect(4300, -2400, 100, 800);
    spawn.mapRect(4400, -2750, 100, 1150);
    spawn.mapRect(4500, -3100, 100, 1500);
    spawn.mapRect(4600, -3450, 100, 1850);
    spawn.mapRect(4100, -3450, 100, 700); //left top shelf
    spawn.mapRect(4200, -3450, 100, 400); //left top shelf
    spawn.mapRect(4300, -3450, 100, 100); //left top shelf
    level.fill.push({
      x: 4100,
      y: -3450,
      width: 500,
      height: 1750,
      color: "rgba(0,20,40,0.1)"
    });
    level.fill.push({
      x: 4100,
      y: -1600,
      width: 600,
      height: 300,
      color: "rgba(0,20,40,0.13)"
    });

    spawn.randomSmallMob(4400, -3500);
    spawn.randomSmallMob(4800, -800);
    spawn.randomSmallMob(800, 150);
    spawn.randomMob(700, -600, 0.8);
    spawn.randomMob(3100, -3600, 0.7);
    spawn.randomMob(3300, -1000, 0.7);
    spawn.randomMob(4200, -250, 0.7);
    spawn.randomMob(4900, -1500, 0.6);
    spawn.randomMob(1200, 100, 0.4);
    spawn.randomMob(5900, -1500, 0.4);
    spawn.randomMob(4700, -800, 0.4);
    spawn.randomMob(1400, -400, 0.3);
    spawn.randomMob(1200, 100, 0.3);
    spawn.randomMob(2550, -100, 0.2);
    spawn.randomMob(2000, -2800, 0.2);
    spawn.randomMob(2000, -500, 0.2);
    spawn.randomMob(4475, -3550, 0.1);
    spawn.randomBoss(5000, -2150, 1);
    spawn.randomBoss(3700, -4100, 0.3);
    spawn.randomBoss(2700, -1600, 0.1);
    spawn.randomBoss(1600, -100, 0);
    spawn.randomBoss(5000, -3900, -0.3);
    if (game.difficulty > 3) {
      if (Math.random() < 0.25) {
        spawn.laserBoss(2900 + 300 * Math.random(), -2950 + 150 * Math.random());
      } else if (Math.random() < 0.33) {
        spawn.laserBoss(1800 + 250 * Math.random(), -2600 + 150 * Math.random());
      } else if (Math.random() < 0.5) {
        spawn.laserBoss(3500 + 250 * Math.random(), -2600 + 1000 * Math.random());
      } else {
        spawn.laserBoss(600 + 200 * Math.random(), -2150 + 250 * Math.random());
      }
    }
  },
  rooftops() {
    level.defaultZoom = 1700
    game.zoomTransition(level.defaultZoom)
    document.body.style.backgroundColor = "#dcdcde";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    if (Math.random() < 0.75) {
      //normal direction start in top left
      mech.setPosToSpawn(-450, -2060);
      level.exit.x = 3600;
      level.exit.y = -300;
      spawn.mapRect(3600, -285, 100, 50); //ground bump wall
      //mobs that spawn in exit room
      spawn.randomSmallMob(4100, -100);
      spawn.randomSmallMob(4600, -100);
      spawn.randomMob(3765, -450, 0.3);
      level.fill.push({
        x: -650,
        y: -2300,
        width: 440,
        height: 300,
        color: "rgba(0,0,0,0.15)"
      });
      level.fillBG.push({
        x: 3460,
        y: -700,
        width: 1090,
        height: 800,
        color: "#d4f4f4"
      });
    } else {
      //reverse direction, start in bottom right
      mech.setPosToSpawn(3650, -325);
      level.exit.x = -550;
      level.exit.y = -2030;
      spawn.mapRect(-550, -2015, 100, 50); //ground bump wall
      spawn.boost(4950, 0, 1600);
      level.fillBG.push({
        x: -650,
        y: -2300,
        width: 440,
        height: 300,
        color: "#d4f4f4"
      });
      level.fill.push({
        x: 3460,
        y: -700,
        width: 1090,
        height: 800,
        color: "rgba(0,0,0,0.1)"
      });
    }
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    spawn.debris(1650, -1800, 3800, 16); //16 debris per level
    powerUps.spawnStartingPowerUps(2450, -1675);

    //foreground

    level.fill.push({
      x: 3460,
      y: -1250,
      width: 1080,
      height: 550,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 4550,
      y: -725,
      width: 900,
      height: 725,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3400,
      y: 100,
      width: 2150,
      height: 900,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: -700,
      y: -1950,
      width: 2100,
      height: 2950,
      color: "rgba(0,0,0,0.1)"
    });

    level.fill.push({
      x: 1860,
      y: -1950,
      width: 630,
      height: 350,
      color: "rgba(0,0,0,0.1)"
    });

    level.fill.push({
      x: 1735,
      y: -1550,
      width: 1390,
      height: 550,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 1600,
      y: -900,
      width: 1650,
      height: 1900,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3510,
      y: -1550,
      width: 330,
      height: 300,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 710,
      y: -2225,
      width: 580,
      height: 225,
      color: "rgba(0,0,0,0.1)"
    });

    //spawn.mapRect(-700, 0, 6250, 100); //ground
    spawn.mapRect(3400, 0, 2150, 100); //ground
    spawn.mapRect(-700, -2000, 2125, 50); //Top left ledge
    spawn.bodyRect(1300, -2125, 50, 125, 0.8);
    spawn.bodyRect(1307, -2225, 50, 100, 0.8);
    spawn.mapRect(-700, -2350, 50, 400); //far left starting left wall
    spawn.mapRect(-700, -2010, 500, 50); //far left starting ground
    spawn.mapRect(-700, -2350, 500, 50); //far left starting ceiling
    spawn.mapRect(-250, -2350, 50, 200); //far left starting right part of wall
    spawn.bodyRect(-240, -2150, 30, 36); //door to starting room
    spawn.bodyRect(-240, -2115, 30, 36); //door to starting room
    spawn.bodyRect(-240, -2080, 30, 35); //door to starting room
    spawn.bodyRect(-240, -2045, 30, 35); //door to starting room
    spawn.mapRect(1850, -2000, 650, 50);
    spawn.bodyRect(200, -2150, 200, 220, 0.8);
    spawn.mapRect(700, -2275, 600, 50);
    spawn.mapRect(1000, -1350, 410, 50);
    spawn.bodyRect(1050, -2350, 30, 30, 0.8);
    // spawn.boost(1800, -1000, 1200);
    spawn.bodyRect(1625, -1100, 100, 75);
    spawn.bodyRect(1350, -1025, 400, 25); // ground plank
    spawn.mapRect(-725, -1000, 2150, 100); //lower left ledge
    spawn.bodyRect(350, -1100, 200, 100, 0.8);
    spawn.bodyRect(370, -1200, 100, 100, 0.8);
    spawn.bodyRect(360, -1300, 100, 100, 0.8);
    spawn.bodyRect(950, -1050, 300, 50, 0.8);
    spawn.bodyRect(-600, -1250, 400, 250, 0.8);
    spawn.mapRect(1575, -1000, 1700, 100); //middle ledge
    spawn.mapRect(3400, -1000, 75, 25);
    spawn.bodyRect(2600, -1950, 100, 250, 0.8);
    spawn.bodyRect(2700, -1125, 125, 125, 0.8);
    spawn.bodyRect(2710, -1250, 125, 125, 0.8);
    spawn.bodyRect(2705, -1350, 75, 100, 0.8);
    spawn.mapRect(3500, -1600, 350, 50);
    spawn.mapRect(1725, -1600, 1435, 50);
    spawn.bodyRect(3100, -1015, 375, 15);
    spawn.bodyRect(3500, -850, 75, 125, 0.8);
    spawn.mapRect(3450, -1000, 50, 580); //left building wall
    spawn.bodyRect(3460, -420, 30, 144);
    spawn.mapRect(5450, -775, 100, 875); //right building wall
    spawn.bodyRect(4850, -750, 300, 25, 0.8);
    spawn.bodyRect(3925, -1400, 100, 150, 0.8);
    spawn.mapRect(3450, -1250, 1090, 50);
    // spawn.mapRect(3450, -1225, 50, 75);
    spawn.mapRect(4500, -1250, 50, 415);
    spawn.mapRect(3450, -725, 1500, 50);
    spawn.mapRect(5100, -725, 400, 50);
    spawn.mapRect(4500, -735, 50, 635);
    spawn.bodyRect(4500, -100, 50, 100);
    spawn.mapRect(4500, -885, 100, 50);
    spawn.spawnStairs(3800, 0, 3, 150, 206); //stairs top exit
    spawn.mapRect(3400, -275, 450, 275); //exit platform

    spawn.randomSmallMob(2200, -1775);
    spawn.randomSmallMob(4000, -825);
    spawn.randomSmallMob(-350, -2400);
    spawn.randomMob(4250, -1350, 0.8);
    spawn.randomMob(2550, -1350, 0.8);
    spawn.randomMob(1225, -2400, 0.3);
    spawn.randomMob(1120, -1200, 0.3);
    spawn.randomMob(3000, -1150, 0.2);
    spawn.randomMob(3200, -1150, 0.3);
    spawn.randomMob(3300, -1750, 0.3);
    spawn.randomMob(3650, -1350, 0.3);
    spawn.randomMob(3600, -1800, 0.1);
    spawn.randomMob(5200, -100, 0.3);
    spawn.randomMob(5275, -900, 0.2);
    spawn.randomMob(900, -2125, 0.3);
    spawn.randomBoss(600, -1575, 0);
    spawn.randomBoss(2225, -1325, 0.4);
    spawn.randomBoss(4900, -1200, 0);
    //spawn.randomBoss(4850, -1250,0.7);
    if (game.difficulty > 3) spawn.randomLevelBoss(3200, -2050);
  },
  aerie() {
    // game.setZoom(3000);
    // game.difficulty = 4; //for testing to simulate possible mobs spawns
    level.defaultZoom = 2100
    game.zoomTransition(level.defaultZoom)

    const backwards = (Math.random() < 0.25 && game.difficulty > 8) ? true : false;
    if (backwards) {
      mech.setPosToSpawn(4000, -3300); //normal spawn
      level.exit.x = -100;
      level.exit.y = -1025;
    } else {
      mech.setPosToSpawn(-50, -1050); //normal spawn
      level.exit.x = 3950;
      level.exit.y = -3275;
    }
    // mech.setPosToSpawn(2250, -900);
    // game.zoomTransition(1500) //1400 is normal

    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);
    spawn.mapRect(level.exit.x, level.exit.y + 15, 100, 20);
    // spawn.mapRect(3950, -3260, 100, 30);

    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    powerUps.spawnStartingPowerUps(1075, -550);
    spawn.debris(-250, 50, 1650, 2); //16 debris per level
    spawn.debris(2475, 0, 750, 2); //16 debris per level
    spawn.debris(3450, 0, 2000, 16); //16 debris per level
    spawn.debris(3500, -2350, 1500, 2); //16 debris per level
    document.body.style.backgroundColor = "#dcdcde";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    //foreground
    level.fill.push({
      x: -100,
      y: -1000,
      width: 1450,
      height: 1400,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 2000,
      y: -1110,
      width: 450,
      height: 1550,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3700,
      y: -3150,
      width: 1100,
      height: 900,
      color: "rgba(0,0,0,0.1)"
    });

    //background
    level.fillBG.push({
      x: 4200,
      y: -2250,
      width: 100,
      height: 2600,
      color: "#c7c7ca"
    });
    if (!backwards) {
      level.fillBG.push({
        x: 3750,
        y: -3650,
        width: 550,
        height: 400,
        color: "#d4f4f4"
      });
      level.fill.push({
        x: -275,
        y: -1275,
        width: 425,
        height: 300,
        color: "rgba(0,0,0,0.1)"
      });
    } else {
      level.fill.push({
        x: 3750,
        y: -3650,
        width: 550,
        height: 400,
        color: "rgba(0,0,0,0.1)"
      });
      level.fillBG.push({
        x: -275,
        y: -1275,
        width: 425,
        height: 300,
        color: "#d4f4f4"
      });
    }

    // starting room
    spawn.mapRect(-300, -1000, 600, 50);
    spawn.mapRect(-300, -1300, 450, 50);
    spawn.mapRect(-300, -1300, 50, 350);
    if (!backwards && game.difficulty > 1) spawn.bodyRect(100, -1250, 200, 240); //remove on backwards
    //left building
    spawn.mapRect(-100, -975, 100, 975);
    spawn.mapRect(-500, 100, 1950, 400);
    spawn.boost(-425, 100, 1400);
    spawn.mapRect(600, -1000, 750, 50);
    spawn.mapRect(900, -500, 550, 50);
    spawn.mapRect(1250, -975, 100, 375);
    spawn.bodyRect(1250, -600, 100, 100, 0.7);
    spawn.mapRect(1250, -450, 100, 450);
    if (!backwards) spawn.bodyRect(1250, -1225, 100, 200); //remove on backwards
    if (!backwards) spawn.bodyRect(1200, -1025, 350, 25); //remove on backwards
    //middle super tower
    if (backwards) {
      spawn.bodyRect(2000, -800, 700, 35);
    } else {
      spawn.bodyRect(1750, -800, 700, 35);
    }
    spawn.mapVertex(2225, -2100, "0 0 450 0 300 -2500 150 -2500")
    spawn.mapRect(2000, -700, 450, 300);
    spawn.bodyRect(2360, -450, 100, 300, 0.6);
    spawn.mapRect(2000, -75, 450, 275);
    spawn.bodyRect(2450, 150, 150, 150, 0.4);
    spawn.mapRect(1550, 300, 4600, 200); //ground
    spawn.boost(5350, 275, 2850);
    // spawn.mapRect(6050, -700, 450, 1200);
    spawn.mapRect(6050, -1060, 450, 1560);
    spawn.mapVertex(6275, -2100, "0 0 450 0 300 -2500 150 -2500")

    //right tall tower
    spawn.mapRect(3700, -3200, 100, 800);
    spawn.mapRect(4700, -2910, 100, 510);
    spawn.mapRect(3700, -2600, 300, 50);
    spawn.mapRect(4100, -2900, 900, 50);
    spawn.mapRect(3450, -2300, 750, 100);
    spawn.mapRect(4300, -2300, 750, 100);
    spawn.mapRect(4150, -1600, 200, 25);
    spawn.mapRect(4150, -700, 200, 25);
    //exit room on top of tower
    spawn.mapRect(3700, -3700, 600, 50);
    spawn.mapRect(3700, -3700, 50, 500);
    spawn.mapRect(4250, -3700, 50, 300);
    spawn.mapRect(3700, -3250, 1100, 100);

    spawn.randomBoss(350, -500, 1)
    spawn.randomSmallMob(-225, 25);
    spawn.randomSmallMob(1000, -1100);
    spawn.randomSmallMob(4000, -250);
    spawn.randomSmallMob(4450, -3000);
    spawn.randomSmallMob(5600, 100);
    spawn.randomMob(4275, -2600, 0.8);
    spawn.randomMob(1050, -700, 0.8)
    spawn.randomMob(6050, -850, 0.7);
    spawn.randomMob(2150, -300, 0.6)
    spawn.randomMob(3900, -2700, 0.8);
    spawn.randomMob(3600, -500, 0.8);
    spawn.randomMob(3400, -200, 0.8);
    spawn.randomMob(1650, -1300, 0.7)
    spawn.randomMob(-4100, -50, 0.7);
    spawn.randomMob(4100, -50, 0.5);
    spawn.randomMob(1700, -50, 0.3)
    spawn.randomMob(2350, -900, 0.3)
    spawn.randomMob(4700, -150, 0.2);
    spawn.randomBoss(4000, -350, 0.6);
    spawn.randomBoss(2750, -550, 0.1);
    if (game.difficulty > 2) {
      if (Math.random() < 0.1) { // tether ball
        spawn.tetherBoss(4250, 0)
        cons[cons.length] = Constraint.create({
          pointA: {
            x: 4250,
            y: -675
          },
          bodyB: mob[mob.length - 1],
          stiffness: 0.00007
        });
        if (game.difficulty > 4) spawn.nodeBoss(4250, 0, "spawns", 8, 20, 105); //chance to spawn a ring of exploding mobs around this boss
      } else {
        //floor below right tall tower
        spawn.bodyRect(3000, 50, 150, 250, 0.9);
        spawn.bodyRect(4500, -500, 300, 250, 0.7);
        spawn.bodyRect(3500, -100, 100, 150, 0.7);
        spawn.bodyRect(4200, -500, 110, 30, 0.7);
        spawn.bodyRect(3800, -500, 150, 130, 0.7);
        spawn.bodyRect(4000, 50, 200, 150, 0.9);
        spawn.bodyRect(4500, 50, 300, 200, 0.9);
        spawn.bodyRect(4200, -350, 200, 50, 0.9);
        spawn.bodyRect(4700, -350, 50, 200, 0.9);
        spawn.bodyRect(4900, -100, 300, 300, 0.7);
        spawn.suckerBoss(4500, -400);
      }
    }
    //add mini boss, giant hopper?   or a black hole that spawns hoppers?
  },
  skyscrapers() {
    level.defaultZoom = 2000
    game.zoomTransition(level.defaultZoom)

    mech.setPosToSpawn(-50, -60); //normal spawn
    //mech.setPosToSpawn(1550, -1200); //spawn left high
    //mech.setPosToSpawn(1800, -2000); //spawn near exit
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);

    level.exit.x = 1500;
    level.exit.y = -1875;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    powerUps.spawnStartingPowerUps(1475, -1175);
    spawn.debris(750, -2200, 3700, 16); //16 debris per level
    document.body.style.backgroundColor = "#dcdcde";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    //foreground
    level.fill.push({
      x: 2500,
      y: -1100,
      width: 450,
      height: 250,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 2400,
      y: -550,
      width: 600,
      height: 150,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 2550,
      y: -1650,
      width: 250,
      height: 200,
      color: "rgba(0,0,0,0.1)"
    });
    //level.fill.push({ x: 1350, y: -2100, width: 400, height: 250, color: "rgba(0,255,255,0.1)" });
    level.fill.push({
      x: 700,
      y: -110,
      width: 400,
      height: 110,
      color: "rgba(0,0,0,0.2)"
    });
    level.fill.push({
      x: 3600,
      y: -110,
      width: 400,
      height: 110,
      color: "rgba(0,0,0,0.2)"
    });
    level.fill.push({
      x: -250,
      y: -300,
      width: 450,
      height: 300,
      color: "rgba(0,0,0,0.15)"
    });

    //background
    level.fillBG.push({
      x: 1300,
      y: -1800,
      width: 750,
      height: 1800,
      color: "#d4d4d7"
    });
    level.fillBG.push({
      x: 3350,
      y: -1325,
      width: 50,
      height: 1325,
      color: "#d4d4d7"
    });
    level.fillBG.push({
      x: 1350,
      y: -2100,
      width: 400,
      height: 250,
      color: "#d4f4f4"
    });

    spawn.mapRect(-300, 0, 5000, 300); //***********ground
    spawn.mapRect(-300, -350, 50, 400); //far left starting left wall
    spawn.mapRect(-300, -10, 500, 50); //far left starting ground
    spawn.mapRect(-300, -350, 500, 50); //far left starting ceiling
    spawn.mapRect(150, -350, 50, 200); //far left starting right part of wall
    spawn.bodyRect(170, -130, 14, 140, 1, spawn.propsFriction); //door to starting room
    spawn.boost(475, 0, 1300);
    spawn.mapRect(700, -1100, 400, 990); //far left building
    spawn.mapRect(1600, -400, 1500, 500); //long center building
    spawn.mapRect(1345, -1100, 250, 25); //left platform
    spawn.mapRect(1755, -1100, 250, 25); //right platform
    spawn.mapRect(1300, -1850, 780, 50); //left higher platform
    spawn.mapRect(1300, -2150, 50, 350); //left higher platform left edge wall
    spawn.mapRect(1300, -2150, 450, 50); //left higher platform roof
    spawn.mapRect(1500, -1860, 100, 50); //ground bump wall
    spawn.mapRect(2400, -850, 600, 300); //center floating large square
    //spawn.bodyRect(2500, -1100, 25, 250); //wall before chasers
    spawn.mapRect(2500, -1450, 450, 350); //higher center floating large square
    spawn.mapRect(2500, -1675, 50, 300); //left wall on higher center floating large square
    spawn.mapRect(2500, -1700, 300, 50); //roof on higher center floating large square
    spawn.mapRect(3300, -850, 150, 25); //ledge by far right building
    spawn.mapRect(3300, -1350, 150, 25); //higher ledge by far right building
    spawn.mapRect(3600, -1100, 400, 990); //far right building
    spawn.boost(4150, 0, 1300);

    spawn.bodyRect(3200, -1375, 300, 25, 0.9);
    spawn.bodyRect(1825, -1875, 400, 25, 0.9);
    // spawn.bodyRect(1800, -575, 250, 150, 0.8);
    spawn.bodyRect(1800, -600, 250, 200, 0.8);
    spawn.bodyRect(2557, -450, 35, 55, 0.7);
    spawn.bodyRect(2957, -450, 30, 15, 0.7);
    spawn.bodyRect(2900, -450, 60, 45, 0.7);
    spawn.bodyRect(915, -1200, 60, 100, 0.95);
    spawn.bodyRect(925, -1300, 50, 100, 0.95);
    if (Math.random() < 0.9) {
      spawn.bodyRect(2300, -1720, 400, 20);
      spawn.bodyRect(2590, -1780, 80, 80);
    }
    spawn.bodyRect(2925, -1100, 25, 250, 0.8);
    spawn.bodyRect(3325, -1550, 50, 200, 0.3);
    if (Math.random() < 0.8) {
      spawn.bodyRect(1400, -75, 200, 75); //block to get up ledge from ground
      spawn.bodyRect(1525, -125, 50, 50); //block to get up ledge from ground
    }
    spawn.bodyRect(1025, -1110, 400, 25, 0.9); //block on far left building
    spawn.bodyRect(1425, -1110, 115, 25, 0.9); //block on far left building
    spawn.bodyRect(1540, -1110, 300, 25, 0.9); //block on far left building

    spawn.randomSmallMob(1300, -70);
    spawn.randomSmallMob(3200, -100);
    spawn.randomSmallMob(4450, -100);
    spawn.randomSmallMob(2700, -475);
    spawn.randomMob(2650, -975, 0.8);
    spawn.randomMob(2650, -1550, 0.8);
    spawn.randomMob(4150, -200, 0.15);
    spawn.randomMob(1700, -1300, 0.2);
    spawn.randomMob(1850, -1950, 0.25);
    spawn.randomMob(2610, -1880, 0.25);
    spawn.randomMob(3350, -950, 0.25);
    spawn.randomMob(1690, -2250, 0.25);
    spawn.randomMob(2200, -600, 0.2);
    spawn.randomMob(850, -1300, 0.25);
    spawn.randomMob(-100, -900, -0.2);
    spawn.randomBoss(3700, -1500, 0.4);
    spawn.randomBoss(1700, -900, 0.4);
    if (game.difficulty > 3) spawn.randomLevelBoss(2200, -1300);
  },
  highrise() {
    level.defaultZoom = 1500
    game.zoomTransition(level.defaultZoom)

    mech.setPosToSpawn(0, -700); //normal spawn
    //mech.setPosToSpawn(-2000, -1700); // left ledge spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);

    level.exit.x = -4275;
    level.exit.y = -2805;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    powerUps.spawnStartingPowerUps(-2550, -700);
    document.body.style.backgroundColor = "#dcdcde" //"#fafcff";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    // spawn.laserZone(-550, -350, 10, 400, 0.3)
    // spawn.deathQuery(-550, -350, 50, 400)

    // spawn.debris(-3950, -2575, 1050, 4); //16 debris per level
    spawn.debris(-2325, -1825, 2400); //16 debris per level
    spawn.debris(-2625, -600, 600, 5); //16 debris per level
    spawn.debris(-2000, -60, 1200, 5); //16 debris per level
    // if (!game.difficulty) powerUps.spawn(2450, -1675, "gun", false);
    //background
    level.fillBG.push({
      x: -4425,
      y: -3050,
      width: 425,
      height: 275,
      color: "#cff"
    });
    //foreground
    level.fill.push({
      x: -1650,
      y: -1575,
      width: 550,
      height: 425,
      color: "rgba(0,0,0,0.12)"
    });
    level.fill.push({
      x: -2600,
      y: -2400,
      width: 450,
      height: 1800,
      color: "rgba(0,0,0,0.12)"
    });
    level.fill.push({
      x: -3425,
      y: -2150,
      width: 525,
      height: 1550,
      color: "rgba(0,0,0,0.12)"
    });
    level.fill.push({
      x: -1850,
      y: -1150,
      width: 2025,
      height: 1150,
      color: "rgba(0,0,0,0.12)"
    });

    //hidden zone
    level.fill.push({
      x: -4450,
      y: -955,
      width: 1025,
      height: 360,
      color: "rgba(64,64,64,0.97)"
    });
    // level.fill.push({
    //   x: -4050,
    //   y: -955,
    //   width: 625,
    //   height: 360,
    //   color: "#444"
    // }); 
    powerUps.spawn(-4300, -700, "heal");
    powerUps.spawn(-4200, -700, "ammo");
    powerUps.spawn(-4000, -700, "ammo");
    spawn.mapRect(-4450, -1000, 100, 500);
    spawn.bodyRect(-3576, -750, 150, 150);


    //building 1
    spawn.bodyRect(-1000, -675, 25, 25);
    spawn.mapRect(-2225, 0, 2475, 150);
    spawn.mapRect(175, -1000, 75, 1100);

    spawn.mapRect(-175, -985, 25, 175);
    spawn.bodyRect(-170, -810, 14, 160, 1, spawn.propsFriction); //door to starting room
    spawn.mapRect(-600, -650, 825, 50);
    spawn.mapRect(-1300, -650, 500, 50);
    spawn.mapRect(-175, -250, 425, 300);
    spawn.bodyRect(-75, -300, 50, 50);

    // spawn.boost(-750, 0, 0, -0.01);
    spawn.boost(-750, 0, 1700);
    spawn.bodyRect(-425, -1375, 400, 225);
    spawn.mapRect(-1125, -1575, 50, 475);
    spawn.bodyRect(-1475, -1275, 250, 125);
    spawn.bodyRect(-825, -1160, 250, 10);

    spawn.mapRect(-1650, -1575, 400, 50);
    spawn.mapRect(-600, -1150, 850, 175);

    spawn.mapRect(-1850, -1150, 1050, 175);
    spawn.bodyRect(-1907, -1600, 550, 25);
    if (game.difficulty < 4) {
      spawn.bodyRect(-1600, -125, 125, 125);
      spawn.bodyRect(-1560, -200, 75, 75);
    } else {
      spawn.bodyRect(-1200, -125, 125, 125);
      spawn.bodyRect(-1160, -200, 75, 75);
    }
    // spawn.bodyRect(-1100, -125, 150, 125);

    // spawn.bodyRect(-1200, -75, 75, 75);

    //building 2
    spawn.mapRect(-4450, -600, 2300, 750);
    spawn.mapRect(-2225, -500, 175, 550);
    // spawn.mapRect(-2600, -975, 450, 50);
    spawn.boost(-2800, -600, 1150);
    spawn.mapRect(-3450, -1325, 550, 50);
    spawn.mapRect(-3425, -2200, 525, 50);
    spawn.mapRect(-2600, -1700, 450, 50);
    spawn.mapRect(-2600, -2450, 450, 50);
    spawn.bodyRect(-2275, -2700, 50, 60);
    spawn.bodyRect(-2600, -1925, 250, 225);
    spawn.bodyRect(-3415, -1425, 100, 100);
    spawn.bodyRect(-3400, -1525, 100, 100);
    spawn.bodyRect(-3305, -1425, 100, 100);

    //building 3
    spawn.mapRect(-4450, -1750, 1025, 1000);
    spawn.mapRect(-3750, -2000, 175, 275);
    spawn.mapRect(-4000, -2350, 275, 675);
    // spawn.mapRect(-4450, -2650, 475, 1000);
    spawn.mapRect(-4450, -2775, 475, 1125);
    spawn.bodyRect(-3715, -2050, 50, 50);
    spawn.bodyRect(-3570, -1800, 50, 50);
    spawn.bodyRect(-2970, -2250, 50, 50);

    spawn.bodyRect(-3080, -2250, 40, 40);
    spawn.bodyRect(-3420, -650, 50, 50);

    //exit
    spawn.mapRect(-4450, -3075, 25, 300);
    spawn.mapRect(-4450, -3075, 450, 25);
    spawn.mapRect(-4025, -3075, 25, 100);
    spawn.mapRect(-4275, -2785, 100, 25);
    if (game.difficulty < 4) spawn.bodyRect(-3760, -2400, 50, 50);

    //mobs
    spawn.randomMob(-2500, -2700, 1);
    spawn.randomMob(-3200, -750, 1);
    spawn.randomMob(-1875, -775, 0.2);
    spawn.randomMob(-950, -1675, 0.2);
    spawn.randomMob(-1525, -1750, 0.2);
    spawn.randomMob(-1375, -1400, 0.2);
    spawn.randomMob(-1625, -1275, 0.2);
    spawn.randomMob(-1900, -1250, 0.2);
    spawn.randomMob(-2250, -1850, 0.2);
    spawn.randomMob(-2475, -2200, 0.2);
    spawn.randomMob(-3000, -1475, 0.2);
    spawn.randomMob(-3850, -2500, 0.2);
    spawn.randomMob(-3650, -2125, 0.2);
    spawn.randomMob(-4010, -3200, 0.2);
    spawn.randomMob(-3500, -1825, 0.2);
    spawn.randomMob(-975, -100, 0);
    spawn.randomMob(-1050, -725, 0.2);
    spawn.randomMob(-1525, -100, 0);
    spawn.randomMob(-525, -1700, -0.1);
    spawn.randomMob(-125, -1500, -0.1);
    spawn.randomMob(-325, -1900, -0.1);
    spawn.randomMob(-550, -100, -0.1);
    spawn.randomBoss(-3250, -2700, 0.2);
    spawn.randomBoss(-2450, -1100, 0);
    if (game.difficulty > 4) spawn.randomLevelBoss(-3400, -2800);

  },
  warehouse() {
    level.defaultZoom = 1300
    game.zoomTransition(level.defaultZoom)

    mech.setPosToSpawn(25, -55); //normal spawn
    //mech.setPosToSpawn(-2000, -1700); // left ledge spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    level.exit.x = 425;
    level.exit.y = -30;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    //level.addQueryRegion(-600, -250, 180, 420, "death", [[player]],{});

    spawn.debris(-2250, 1330, 3000, 6); //16 debris per level
    spawn.debris(-3000, -800, 3280, 6); //16 debris per level
    spawn.debris(-1400, 410, 2300, 5); //16 debris per level
    powerUps.spawnStartingPowerUps(25, 500);
    document.body.style.backgroundColor = "#dcdcde" //"#f2f5f3";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    //foreground
    // level.fill.push({ x: -3025, y: 50, width: 4125, height: 1350, color: "rgba(0,0,0,0.05)"});
    // level.fill.push({ x: -1800, y: -500, width: 1975, height: 550, color: "rgba(0,0,0,0.05)"});
    // level.fill.push({ x: -2600, y: -150, width: 700, height: 200, color: "rgba(0,0,0,0.05)"});
    //background
    const BGColor = "rgba(0,0,0,0.1)";
    level.fill.push({
      x: -3025,
      y: 50,
      width: 4125,
      height: 1350,
      color: BGColor
    });
    level.fill.push({
      x: -1800,
      y: -500,
      width: 1625,
      height: 550,
      color: BGColor
    });
    level.fill.push({
      x: -175,
      y: -250,
      width: 350,
      height: 300,
      color: BGColor
    });
    level.fill.push({
      x: -2600,
      y: -150,
      width: 700,
      height: 200,
      color: BGColor
    });
    level.fillBG.push({
      x: 300,
      y: -250,
      width: 350,
      height: 250,
      color: "#cff"
    });
    spawn.mapRect(-1500, 0, 2750, 100);
    spawn.mapRect(175, -270, 125, 300);
    spawn.mapRect(-1900, -600, 1775, 100);
    spawn.mapRect(-1900, -600, 100, 1300);
    //house
    spawn.mapRect(-175, -550, 50, 400);
    spawn.mapRect(-175, -10, 350, 50);
    spawn.mapRect(-25, -20, 100, 50);
    // spawn.mapRect(-175, -275, 350, 25);
    // spawn.mapRect(-175, -250, 25, 75);
    // spawn.bodyRect(-170, -175, 14, 160, 1, spawn.propsFriction); //door to starting room
    //exit house
    spawn.mapRect(300, -10, 350, 50);
    spawn.mapRect(-150, -300, 800, 50);
    spawn.mapRect(600, -275, 50, 75);
    spawn.mapRect(425, -20, 100, 25);
    // spawn.mapRect(-1900, 600, 2700, 100);
    spawn.mapRect(1100, 0, 150, 1500);
    spawn.mapRect(-2850, 1400, 4100, 100);
    spawn.mapRect(-2375, 875, 1775, 75);
    spawn.mapRect(-1450, 865, 75, 435);
    spawn.mapRect(-1450, 662, 75, 100);
    spawn.bodyRect(-1418, 773, 11, 102, 1, spawn.propsFriction); //blocking path
    spawn.mapRect(-2950, 1250, 175, 250);
    spawn.mapRect(-3050, 1100, 150, 400);
    spawn.mapRect(-3150, 50, 125, 1450);
    spawn.mapRect(-2375, 600, 3175, 100);
    spawn.mapRect(-2125, 400, 250, 275);
    // spawn.mapRect(-1950, -400, 100, 25);
    spawn.mapRect(-3150, 50, 775, 100);
    spawn.mapRect(-2600, -250, 775, 100);
    spawn.bodyRect(-1350, -200, 200, 200, 1, spawn.propsSlide); //weight
    spawn.bodyRect(-1800, 0, 300, 100, 1, spawn.propsHoist); //hoist
    cons[cons.length] = Constraint.create({
      pointA: {
        x: -1650,
        y: -500
      },
      bodyB: body[body.length - 1],
      stiffness: 0.000076,
      length: 1
    });

    spawn.bodyRect(400, 400, 200, 200, 1, spawn.propsSlide); //weight
    spawn.bodyRect(800, 600, 300, 100, 1, spawn.propsHoist); //hoist
    cons[cons.length] = Constraint.create({
      pointA: {
        x: 950,
        y: 100
      },
      bodyB: body[body.length - 1],
      stiffness: 0.000076,
      length: 1
    });

    spawn.bodyRect(-2700, 1150, 100, 160, 1, spawn.propsSlide); //weight
    spawn.bodyRect(-2550, 1150, 200, 100, 1, spawn.propsSlide); //weight

    spawn.bodyRect(-2775, 1300, 400, 100, 1, spawn.propsHoist); //hoist
    cons[cons.length] = Constraint.create({
      pointA: {
        x: -2575,
        y: 150
      },
      bodyB: body[body.length - 1],
      stiffness: 0.0002,
      length: 566
    });

    //blocks
    //spawn.bodyRect(-155, -150, 10, 140, 1, spawn.propsFriction);
    spawn.bodyRect(-165, -150, 30, 35, 1);
    spawn.bodyRect(-165, -115, 30, 35, 1);
    spawn.bodyRect(-165, -80, 30, 35, 1);
    spawn.bodyRect(-165, -45, 30, 35, 1);

    spawn.bodyRect(-750, 400, 150, 150, 0.5);
    spawn.bodyRect(-400, 1175, 100, 250, 1); //block to get to top path on bottom level
    // spawn.bodyRect(-1450, 737, 75, 103, 0.5); //blocking path

    spawn.bodyRect(-2525, -50, 145, 100, 0.5);
    spawn.bodyRect(-2325, -300, 150, 100, 0.5);
    spawn.bodyRect(-1275, -750, 200, 150, 0.5); //roof block
    spawn.bodyRect(-525, -700, 125, 100, 0.5); //roof block

    //mobs
    spawn.randomSmallMob(-1125, 550);
    spawn.randomSmallMob(-2325, 800);
    spawn.randomSmallMob(-2950, -50);
    spawn.randomSmallMob(825, 300);
    spawn.randomSmallMob(-900, 825);
    spawn.randomMob(-2025, 175, 0.6);
    spawn.randomMob(-2325, 450, 0.6);
    spawn.randomMob(-2925, 675, 0.5);
    spawn.randomMob(-2700, 300, 0.2);
    spawn.randomMob(-2500, 300, 0.2);
    spawn.randomMob(-2075, -425, 0.2);
    spawn.randomMob(-1550, -725, 0.2);
    spawn.randomMob(375, 1100, 0.1);
    spawn.randomMob(-1425, -100, 0.1);
    spawn.randomMob(-800, -750, 0);
    spawn.randomMob(400, -350, 0);
    spawn.randomMob(650, 1300, 0);
    spawn.randomMob(-750, -150, 0);
    spawn.randomMob(475, 300, 0);
    spawn.randomMob(-75, -700, 0);
    spawn.randomMob(900, -200, -0.1);
    spawn.randomBoss(-125, 275, -0.2);
    spawn.randomBoss(-825, 1000, 0.2);
    spawn.randomBoss(-1300, -1100, -0.3);
    //spawn.randomBoss(600, -1575, 0);
    //spawn.randomMob(1120, -1200, 0.3);
    //spawn.randomSmallMob(2200, -1775);

    if (game.difficulty > 2) spawn.snakeBoss(-1300 + Math.random() * 2000, -2200); //boss snake with head
  },
  office() {
    level.defaultZoom = 1400
    game.zoomTransition(level.defaultZoom)

    if (Math.random() < 0.75) {
      //normal direction start in top left
      mech.setPosToSpawn(1375, -1550); //normal spawn
      level.exit.x = 3250;
      level.exit.y = -530;
      // spawn.randomSmallMob(3550, -550);
      level.fillBG.push({
        x: 3050,
        y: -950,
        width: 625,
        height: 500,
        color: "#dff"
      });
    } else {
      //reverse direction, start in bottom right
      mech.setPosToSpawn(3250, -550); //normal spawn
      level.exit.x = 1375;
      level.exit.y = -1530;
      // spawn.bodyRect(3655, -650, 40, 150); //door
      level.fillBG.push({
        x: 725,
        y: -1950,
        width: 825,
        height: 450,
        color: "#dff"
      });
    }
    spawn.mapRect(level.exit.x, level.exit.y + 20, 100, 50); //ground bump wall
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);

    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    document.body.style.backgroundColor = "#e0e5e0";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    // foreground
    level.fill.push({
      x: -550,
      y: -1700,
      width: 1300,
      height: 1700,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 750,
      y: -1450,
      width: 650,
      height: 1450,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 750,
      y: -1950,
      width: 800,
      height: 450,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3000,
      y: -1000,
      width: 650,
      height: 1000,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3650,
      y: -1300,
      width: 1300,
      height: 1300,
      color: "rgba(0,0,0,0.1)"
    });

    //mech.setPosToSpawn(600, -1200); //normal spawn
    //mech.setPosToSpawn(525, -150); //ground first building
    //mech.setPosToSpawn(3150, -700); //near exit spawn
    spawn.debris(-300, -200, 1000, 4); //ground debris //16 debris per level
    spawn.debris(3500, -200, 800, 4); //ground debris //16 debris per level
    spawn.debris(-300, -650, 1200, 4); //1st floor debris //16 debris per level
    spawn.debris(3500, -650, 800, 5); //1st floor debris //16 debris per level
    powerUps.spawnStartingPowerUps(-525, -700);

    spawn.mapRect(-600, 25, 5600, 300); //ground
    spawn.mapRect(-600, 0, 2000, 50); //ground
    spawn.mapRect(-600, -1700, 50, 2000 - 100); //left wall
    spawn.bodyRect(-295, -1540, 40, 40); //center block under wall
    spawn.bodyRect(-298, -1580, 40, 40); //center block under wall
    spawn.bodyRect(1500, -1540, 30, 30); //left of entrance

    spawn.mapRect(1550, -2000, 50, 550); //right wall
    spawn.mapRect(1350, -2000 + 505, 50, 1295); //right wall
    spawn.mapRect(-600, -2000 + 250, 2000 - 700, 50); //roof left
    spawn.mapRect(-600 + 1300, -2000, 50, 300); //right roof wall
    spawn.mapRect(-600 + 1300, -2000, 900, 50); //center wall

    map[map.length] = Bodies.polygon(725, -1700, 0, 15); //circle above door
    spawn.bodyRect(720, -1675, 15, 170, 1, spawn.propsDoor); // door
    body[body.length - 1].isNotHoldable = true;
    //makes door swing
    consBB[consBB.length] = Constraint.create({
      bodyA: body[body.length - 1],
      pointA: {
        x: 0,
        y: -90
      },
      bodyB: map[map.length - 1],
      stiffness: 1
    });
    spawn.mapRect(-600 + 300, -2000 * 0.75, 1900, 50); //3rd floor
    spawn.mapRect(-600 + 2000 * 0.7, -2000 * 0.74, 50, 375); //center wall
    spawn.bodyRect(-600 + 2000 * 0.7, -2000 * 0.5 - 106, 50, 106); //center block under wall
    spawn.mapRect(-600, -1000, 1100, 50); //2nd floor
    spawn.mapRect(600, -1000, 500, 50); //2nd floor
    spawn.spawnStairs(-600, -1000, 4, 250, 350); //stairs 2nd
    spawn.mapRect(350, -600, 350, 150); //center table
    spawn.mapRect(-600 + 300, -2000 * 0.25, 2000 - 300, 50); //1st floor
    spawn.spawnStairs(-600 + 2000 - 50, -500, 4, 250, 350, true); //stairs 1st
    spawn.spawnStairs(-600, 0, 4, 250, 350); //stairs ground
    spawn.bodyRect(700, -200, 100, 100); //center block under wall
    spawn.bodyRect(700, -300, 100, 100); //center block under wall
    spawn.bodyRect(700, -400, 100, 100); //center block under wall
    spawn.mapRect(1390, 13, 30, 20); //step left
    spawn.mapRect(2980, 13, 30, 20); //step right
    spawn.mapRect(3000, 0, 2000, 50); //ground
    spawn.bodyRect(4250, -700, 50, 100);
    spawn.bodyRect(3000, -200, 50, 200); //door
    spawn.mapRect(3000, -1000, 50, 800); //left wall
    spawn.mapRect(3000 + 2000 - 50, -1300, 50, 1100); //right wall
    spawn.mapRect(4150, -600, 350, 150); //table
    spawn.mapRect(3650, -1300, 50, 650); //exit wall
    spawn.mapRect(3650, -1300, 1350, 50); //exit wall
    spawn.bodyRect(3665, -650, 20, 150); //door


    spawn.mapRect(3000, -2000 * 0.5, 700, 50); //exit roof
    spawn.mapRect(3000, -2000 * 0.25, 2000 - 300, 50); //1st floor
    spawn.spawnStairs(3000 + 2000 - 50, 0, 4, 250, 350, true); //stairs ground

    spawn.randomSmallMob(4575, -560, 1);
    spawn.randomSmallMob(1315, -880, 1);
    spawn.randomSmallMob(800, -600);
    spawn.randomSmallMob(-100, -1600);
    spawn.randomMob(4100, -225, 0.8);
    spawn.randomMob(-250, -700, 0.8);
    spawn.randomMob(4500, -225, 0.15);
    spawn.randomMob(3250, -225, 0.15);
    spawn.randomMob(-100, -225, 0.1);
    spawn.randomMob(1150, -225, 0.15);
    spawn.randomMob(2000, -225, 0.15);
    spawn.randomMob(450, -225, 0.15);
    spawn.randomMob(100, -1200, 1);
    spawn.randomMob(950, -1150, -0.1);
    spawn.randomBoss(1800, -800, -0.2);
    spawn.randomBoss(4150, -1000, 0.6);

    if (game.difficulty > 2) {
      if (Math.random() < 0.75) {
        // tether ball
        level.fillBG.push({
          x: 2495,
          y: -500,
          width: 10,
          height: 525,
          color: "#ccc"
        });
        spawn.tetherBoss(2850, -80)
        cons[cons.length] = Constraint.create({
          pointA: {
            x: 2500,
            y: -500
          },
          bodyB: mob[mob.length - 1],
          stiffness: 0.00012
        });
        //chance to spawn a ring of exploding mobs around this boss
        if (game.difficulty > 4) spawn.nodeBoss(2850, -80, "spawns", 8, 20, 105);
      } else if (game.difficulty > 3) {
        spawn.shooterBoss(2200, -650);
      }
    }
  },
  stronghold() { // player made level  by    Francois 👑   from discord
    level.defaultZoom = 1400

    game.zoomTransition(level.defaultZoom)
    mech.setPosToSpawn(1900, -10); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y - 10;
    level.exit.x = -350;
    level.exit.y = -1250;
    level.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    spawn.mapRect(level.exit.x, level.exit.y + 25, 100, 20); //exit bump
    spawn.debris(3800, -1480, 300, 12);
    spawn.debris(3600, -1130, 200, 2);
    document.body.style.backgroundColor = "#dbdcde";
    // game.draw.mapFill = "#444"
    // game.draw.bodyFill = "rgba(140,140,140,0.85)"
    // game.draw.bodyStroke = "#222"

    level.fillBG.push({
      x: -500,
      y: -1220,
      width: 550,
      height: -480,
      color: "#edf9f9"
    });
    level.fillBG.push({
      x: 0,
      y: -700,
      width: 1050,
      height: 700,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: -550,
      y: -1170,
      width: 550,
      height: 1170,
      color: "rgba(0,0,0,0.1)"
    });

    level.fillBG.push({
      x: 1150,
      y: -1700,
      width: 250,
      height: 1700,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: 1050,
      y: -1200,
      width: 100,
      height: 1200,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: 1400,
      y: -250,
      width: 200,
      height: -1500,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: 1600,
      y: -550,
      width: 600,
      height: -1150,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: 2530,
      y: -550,
      width: 400,
      height: -1450,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: 3270,
      y: -1700,
      width: 80,
      height: 600,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: 3350,
      y: -1350,
      width: 700,
      height: 230,
      color: "rgba(0,0,0,0.1)"
    });

    level.fillBG.push({
      x: 4050,
      y: -1700,
      width: 600,
      height: 1290,
      color: "rgba(0,0,0,0.1)"
    });
    level.fillBG.push({
      x: 3650,
      y: -110,
      width: 1000,
      height: 170,
      color: "rgba(0,0,0,0.1)"
    });


    // __________________________________________________________________________________________________
    // Spawn Box
    spawn.mapRect(1600, -500, 50, 500); //Left Wall
    spawn.mapRect(1600, -550, 1500, 50); //Roof
    spawn.mapRect(2300, -500, 50, 300); //Right Wall

    spawn.mapRect(-550, 0, 4300, 200); //ground
    spawn.mapRect(3700, 55, 1300, 145); //2nd ground
    spawn.mapRect(5000, 0, 50, 200); //Last small part of the ground
    spawn.mapRect(3100, -1070, 50, 570); // vertical 2nd roof
    spawn.mapRect(3100, -1120, 950, 50); // Horizontal 2nd Roof
    spawn.mapRect(4050, -1750, 600, 50); // Roof after lift 
    spawn.mapRect(4600, -1700, 50, 100); // Petit retour de toit, après ascenseur

    //Spawn "Upstairs" 
    spawn.mapRect(3650, -160, 400, 50); //Thin Walk
    spawn.mapRect(4050, -410, 600, 300); //Large staircase block
    spawn.mapRect(4600, -1120, 50, 710); //Left Wall Wall upstairs
    spawn.mapRect(4550, -1170, 100, 50); //Bloque ascenseur
    spawn.mapVertex(3700, 35, "0 0 450 0 300 -60 150 -60"); //first slope
    spawn.mapVertex(4850, 35, "0 0 370 0 370 -65 150 -65"); //second slope
    spawn.boost(4865, 0, 1800); // right boost
    spawn.bodyRect(3950, -280, 170, 120); //Bloc Marche Pour Monter À Ascenseur
    // spawn.bodyRect(-2700, 1150, 100, 160, 1, spawn.propsSlide); //weight
    // spawn.bodyRect(-2550, 1150, 200, 100, 1, spawn.propsSlide); //weight
    spawn.bodyRect(4050, -500, 275, 100, 1, spawn.propsSlide); //weight
    spawn.bodyRect(4235, -500, 275, 100, 1, spawn.propsSlide); //weight
    // spawn.bodyRect(-2775, 1300, 400, 100, 1, spawn.propsHoist); //hoist
    spawn.bodyRect(4025, -450, 550, 100, 1, spawn.propsHoist); //hoist
    cons[cons.length] = Constraint.create({
      pointA: {
        x: 4325,
        y: -1700,
      },
      bodyB: body[body.length - 1],
      stiffness: 0.0001217,
      length: 200
    });

    spawn.bodyRect(2799, -870, 310, 290); //Gros bloc angle toit
    spawn.mapRect(4000, -1750, 50, 400); //Right Wall Cuve
    spawn.mapRect(3400, -1400, 600, 50); // Bottom Cuve
    spawn.mapRect(3350, -1750, 50, 400); // Left Wall Cuve
    spawn.bodyRect(3400, -1470, 110, 70); //Moyen bloc dans la cuve
    spawn.mapRect(3270, -1750, 80, 50); // Rebord gauche cuve

    spawn.mapRect(2530, -2000, 400, 50); //First Plateforme
    spawn.mapRect(1600, -1750, 600, 50); // Middle plateforme
    spawn.mapRect(1150, -1750, 250, 50); //Derniere plateforme // Toit petite boite en [
    spawn.bodyRect(1830, -1980, 190, 230); // Fat bloc plateforme middle 
    spawn.bodyRect(1380, -1770, 250, 20) // Pont last plateforme

    spawn.mapRect(1000, -1250, 400, 50); //Sol de la petite boite en [
    spawn.mapRect(1100, -1750, 50, 380); //Mur gauche petite boite en [
    spawn.bodyRect(1100, -1380, 48, 119); //Bloc-porte petite boite en [

    spawn.mapRect(-100, -750, 1100, 50); //Sol last salle
    spawn.mapRect(1000, -1200, 50, 500) // Mur droit last salle
    spawn.mapRect(50, -1550, 1050, 50); // Toit last salle
    spawn.bodyRect(1, -900, 48, 150); //Bloc porte last salle
    spawn.mapRect(0, -1170, 50, 270); //Mur gauche en bas last salle
    spawn.bodyRect(920, -900, 120, 120); //Gros bloc last salle

    spawn.mapRect(0, -1700, 50, 320); // Mur droit salle exit / Mur gauche last salle
    spawn.mapRect(-550, -1220, 600, 50); // Sol exit room
    spawn.mapRect(-500, -1750, 550, 50); // Toit exit room
    spawn.mapRect(-550, -1750, 50, 530); // Mur gauche exit room
    spawn.bodyRect(-503, -1250, 30, 30); // Petit bloc exit room

    spawn.mapRect(500, -700, 100, 590); //Bloc noir un dessous last salle
    spawn.mapRect(1400, -250, 200, 250); //Black Block left from the spawn
    spawn.boost(-370, 0, 800);

    map[map.length] = Bodies.polygon(2325, -205, 0, 15); //circle above door
    spawn.bodyRect(2325, -180, 15, 170, 1, spawn.propsDoor); // door
    body[body.length - 1].isNotHoldable = true;
    //makes door swing
    consBB[consBB.length] = Constraint.create({
      bodyA: body[body.length - 1],
      pointA: {
        x: 0,
        y: -90
      },
      bodyB: map[map.length - 1],
      stiffness: 1
    });

    spawn.bodyRect(650, 50, 70, 50);
    spawn.bodyRect(300, 0, 100, 60);
    spawn.bodyRect(400, 0, 100, 150);
    spawn.bodyRect(2545, -50, 70, 50);
    spawn.bodyRect(2550, 0, 100, 30);

    spawn.randomSmallMob(1000, -400, 1);
    spawn.randomSmallMob(2550, -560, 1);
    spawn.randomSmallMob(3350, -900, 1);
    spawn.randomSmallMob(3600, -1210, 1);
    spawn.randomSmallMob(700, -1950, 0.2);
    spawn.randomSmallMob(5050, -550);
    spawn.randomMob(900, -160, 1);
    spawn.randomMob(2360, -820, 0.8);
    spawn.randomMob(2700, -2020, 0.8);
    spawn.randomMob(3050, -1650, 0.8);
    spawn.randomMob(3350, -600, 0.8);
    spawn.randomMob(4400, -50, 1);
    spawn.randomBoss(1500, -1900, 0.5);
    spawn.randomBoss(2350, -850, 1);
    spawn.randomBoss(100, -450, 0.9);
    if (game.difficulty > 3) spawn.randomLevelBoss(1850, -1400, 1);
  },
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  enter: {
    x: 0,
    y: 0,
    draw() {
      ctx.beginPath();
      ctx.moveTo(level.enter.x, level.enter.y + 30);
      ctx.lineTo(level.enter.x, level.enter.y - 80);
      ctx.bezierCurveTo(level.enter.x, level.enter.y - 170, level.enter.x + 100, level.enter.y - 170, level.enter.x + 100, level.enter.y - 80);
      ctx.lineTo(level.enter.x + 100, level.enter.y + 30);
      ctx.lineTo(level.enter.x, level.enter.y + 30);
      ctx.fillStyle = "#ccc";
      ctx.fill();
    }
  },
  exit: {
    x: 0,
    y: 0,
    draw() {
      ctx.beginPath();
      ctx.moveTo(level.exit.x, level.exit.y + 30);
      ctx.lineTo(level.exit.x, level.exit.y - 80);
      ctx.bezierCurveTo(level.exit.x, level.exit.y - 170, level.exit.x + 100, level.exit.y - 170, level.exit.x + 100, level.exit.y - 80);
      ctx.lineTo(level.exit.x + 100, level.exit.y + 30);
      ctx.lineTo(level.exit.x, level.exit.y + 30);
      ctx.fillStyle = "#0ff";
      ctx.fill();
    }
  },
  fillBG: [],
  drawFillBGs() {
    for (let i = 0, len = level.fillBG.length; i < len; ++i) {
      const f = level.fillBG[i];
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, f.y, f.width, f.height);
    }
  },
  fill: [],
  drawFills() {
    for (let i = 0, len = level.fill.length; i < len; ++i) {
      const f = level.fill[i];
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, f.y, f.width, f.height);
    }
  },
  zones: [], //zone do actions when player is in a region   // to effect everything use a query
  checkZones() {
    for (let i = 0, len = level.zones.length; i < len; ++i) {
      if (
        player.position.x > level.zones[i].x1 &&
        player.position.x < level.zones[i].x2 &&
        player.position.y > level.zones[i].y1 &&
        player.position.y < level.zones[i].y2
      ) {
        level.zoneActions[level.zones[i].action](i);
        break;
      }
    }
  },
  addZone(x, y, width, height, action, info) {
    level.zones[level.zones.length] = {
      x1: x,
      y1: y - 150,
      x2: x + width,
      y2: y + height - 70, //-70 to adjust for player height
      action: action,
      info: info
    };
  },
  zoneActions: {
    fling(i) {
      Matter.Body.setVelocity(player, {
        x: level.zones[i].info.Vx,
        y: level.zones[i].info.Vy
      });
    },
    nextLevel() {
      //enter when player isn't falling
      if (player.velocity.y < 0.1) {
        level.levelsCleared++;
        level.onLevel++; //cycles map to next level
        if (level.onLevel > level.levels.length - 1) level.onLevel = 0;

        level.difficultyIncrease(game.difficultyMode) //increase difficulty based on modes
        if (game.isEasyMode && level.levelsCleared % 2) level.difficultyDecrease(1);
        game.clearNow = true; //triggers in game.clearMap to remove all physics bodies and setup for new map
      }
    },
    death() {
      mech.death();
    },
    laser(i) {
      //draw these in game with spawn.background
      mech.damage(level.zones[i].info.dmg);
    },
    slow() {
      Matter.Body.setVelocity(player, {
        x: player.velocity.x * 0.5,
        y: player.velocity.y * 0.5
      });
    }
  },
  queryList: [], //queries do actions on many objects in regions  (for only player use a zone)
  checkQuery() {
    let bounds, action, info;

    function isInZone(targetArray) {
      let results = Matter.Query.region(targetArray, bounds);
      for (let i = 0, len = results.length; i < len; ++i) {
        level.queryActions[action](results[i], info);
      }
    }
    for (let i = 0, len = level.queryList.length; i < len; ++i) {
      bounds = level.queryList[i].bounds;
      action = level.queryList[i].action;
      info = level.queryList[i].info;
      for (let j = 0, l = level.queryList[i].groups.length; j < l; ++j) {
        isInZone(level.queryList[i].groups[j]);
      }
    }
  },
  //oddly query regions can't get smaller than 50 width?
  addQueryRegion(x, y, width, height, action, groups = [
    [player], body, mob, powerUp, bullet
  ], info) {
    level.queryList[level.queryList.length] = {
      bounds: {
        min: {
          x: x,
          y: y
        },
        max: {
          x: x + width,
          y: y + height
        }
      },
      action: action,
      groups: groups,
      info: info
    };
  },
  queryActions: {
    bounce(target, info) {
      //jerky fling upwards
      Matter.Body.setVelocity(target, {
        x: info.Vx + (Math.random() - 0.5) * 6,
        y: info.Vy
      });
      target.torque = (Math.random() - 0.5) * 2 * target.mass;
    },
    boost(target, yVelocity) {
      // if (target.velocity.y < 0) {
      // mech.undoCrouch();
      // mech.enterAir();
      mech.buttonCD_jump = 0; // reset short jump counter to prevent short jumps on boosts
      mech.hardLandCD = 0 // disable hard landing
      if (target.velocity.y > 30) {
        Matter.Body.setVelocity(target, {
          x: target.velocity.x + (Math.random() - 0.5) * 2,
          y: -23 //gentle bounce if coming down super fast
        });
      } else {
        Matter.Body.setVelocity(target, {
          x: target.velocity.x + (Math.random() - 0.5) * 2,
          y: yVelocity
        });
      }

    },
    force(target, info) {
      if (target.velocity.y < 0) {
        //gently force up if already on the way up
        target.force.x += info.Vx * target.mass;
        target.force.y += info.Vy * target.mass;
      } else {
        target.force.y -= 0.0007 * target.mass; //gently fall in on the way down
      }
    },
    antiGrav(target) {
      target.force.y -= 0.0011 * target.mass;
    },
    death(target) {
      target.death();
    }
  },
  addToWorld() {
    //needs to be run to put bodies into the world
    for (let i = 0; i < body.length; i++) {
      //body[i].collisionFilter.group = 0;
      body[i].collisionFilter.category = cat.body;
      body[i].collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet
      body[i].classType = "body";
      World.add(engine.world, body[i]); //add to world
    }
    for (let i = 0; i < map.length; i++) {
      //map[i].collisionFilter.group = 0;
      map[i].collisionFilter.category = cat.map;
      map[i].collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet;
      Matter.Body.setStatic(map[i], true); //make static
      World.add(engine.world, map[i]); //add to world
    }
    for (let i = 0; i < cons.length; i++) {
      World.add(engine.world, cons[i]);
    }
    for (let i = 0; i < consBB.length; i++) {
      World.add(engine.world, consBB[i]);
    }
  }
};