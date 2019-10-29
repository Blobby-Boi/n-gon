//global player variables for use in matter.js physics
let player, jumpSensor, playerBody, playerHead, headSensor;

// player Object Prototype *********************************************
const mech = {
  spawn() {
    //load player in matter.js physic engine
    // let vector = Vertices.fromPath("0 40  50 40   50 115   0 115   30 130   20 130"); //player as a series of vertices
    let vector = Vertices.fromPath("0,40, 50,40, 50,115, 30,130, 20,130, 0,115, 0,40"); //player as a series of vertices
    playerBody = Matter.Bodies.fromVertices(0, 0, vector);
    jumpSensor = Bodies.rectangle(0, 46, 36, 6, {
      //this sensor check if the player is on the ground to enable jumping
      sleepThreshold: 99999999999,
      isSensor: true
    });
    vector = Vertices.fromPath("16 -82  2 -66  2 -37  43 -37  43 -66  30 -82");
    playerHead = Matter.Bodies.fromVertices(0, -55, vector); //this part of the player lowers on crouch
    headSensor = Bodies.rectangle(0, -57, 48, 45, {
      //senses if the player's head is empty and can return after crouching
      sleepThreshold: 99999999999,
      isSensor: true
    });
    player = Body.create({
      //combine jumpSensor and playerBody
      parts: [playerBody, playerHead, jumpSensor, headSensor],
      inertia: Infinity, //prevents player rotation
      friction: 0.002,
      frictionAir: 0.001,
      //frictionStatic: 0.5,
      restitution: 0,
      sleepThreshold: Infinity,
      collisionFilter: {
        group: 0,
        category: 0x001000,
        mask: 0x010011
      },
      death() {
        mech.death();
      }
    });
    Matter.Body.setMass(player, mech.mass);
    World.add(engine.world, [player]);

    mech.holdConstraint = Constraint.create({
      //holding body constraint
      pointA: {
        x: 0,
        y: 0
      },
      bodyB: jumpSensor, //setting constraint to jump sensor because it has to be on something until the player picks up things
      stiffness: 0.4
    });
    World.add(engine.world, mech.holdConstraint);
  },
  cycle: 0,
  width: 50,
  radius: 30,
  fillColor: "#fff",
  fillColorDark: "#ccc",
  height: 42,
  yOffWhen: {
    crouch: 22,
    stand: 49,
    jump: 70
  },
  mass: 5,
  Fx: 0.015, //run Force on ground
  FxAir: 0.015, //run Force in Air
  definePlayerMass(mass = 5) {
    Matter.Body.setMass(player, mass);
    //reduce air and ground move forces
    this.Fx = 0.075 / mass
    this.FxAir = 0.375 / mass / mass
    //make player stand a bit lower when holding heavy masses
    this.yOffWhen.stand = Math.max(this.yOffWhen.crouch, Math.min(49, 49 - (mass - 5) * 6))
    if (this.onGround && !this.crouch) this.yOffGoal = this.yOffWhen.stand;
  },
  yOff: 70,
  yOffGoal: 70,
  onGround: false, //checks if on ground or in air
  standingOn: undefined,
  numTouching: 0,
  crouch: false,
  isHeadClear: true,
  spawnPos: {
    x: 0,
    y: 0
  },
  spawnVel: {
    x: 0,
    y: 0
  },
  pos: {
    x: 0,
    y: 0
  },
  setPosToSpawn(xPos, yPos) {
    this.spawnPos.x = this.pos.x = xPos;
    this.spawnPos.y = this.pos.y = yPos;
    this.transX = this.transSmoothX = canvas.width2 - this.pos.x;
    this.transY = this.transSmoothY = canvas.height2 - this.pos.y;
    this.Vx = this.spawnVel.x;
    this.Vy = this.spawnVel.y;
    player.force.x = 0;
    player.force.y = 0;
    Matter.Body.setPosition(player, this.spawnPos);
    Matter.Body.setVelocity(player, this.spawnVel);
  },
  Sy: 0, //adds a smoothing effect to vertical only
  Vx: 0,
  Vy: 0,
  jumpForce: 0.38,
  gravity: 0.0019,
  friction: {
    ground: 0.01,
    air: 0.0025
  },
  angle: 0,
  walk_cycle: 0,
  stepSize: 0,
  flipLegs: -1,
  hip: {
    x: 12,
    y: 24
  },
  knee: {
    x: 0,
    y: 0,
    x2: 0,
    y2: 0
  },
  foot: {
    x: 0,
    y: 0
  },
  legLength1: 55,
  legLength2: 45,
  transX: 0,
  transY: 0,
  move() {
    this.pos.x = player.position.x;
    this.pos.y = playerBody.position.y - this.yOff;
    this.Vx = player.velocity.x;
    this.Vy = player.velocity.y;
  },
  transSmoothX: 0,
  transSmoothY: 0,
  lastGroundedPositionY: 0,
  // mouseZoom: 0,
  look() {
    //always on mouse look
    this.angle = Math.atan2(
      game.mouseInGame.y - this.pos.y,
      game.mouseInGame.x - this.pos.x
    );
    //smoothed mouse look translations
    const scale = 0.8;
    this.transSmoothX = canvas.width2 - this.pos.x - (game.mouse.x - canvas.width2) * scale;
    this.transSmoothY = canvas.height2 - this.pos.y - (game.mouse.y - canvas.height2) * scale;

    this.transX += (this.transSmoothX - this.transX) * 0.07;
    this.transY += (this.transSmoothY - this.transY) * 0.07;
  },
  doCrouch() {
    if (!this.crouch) {
      this.crouch = true;
      this.yOffGoal = this.yOffWhen.crouch;
      Matter.Body.translate(playerHead, {
        x: 0,
        y: 40
      });
    }
  },
  undoCrouch() {
    if (this.crouch) {
      this.crouch = false;
      this.yOffGoal = this.yOffWhen.stand;
      Matter.Body.translate(playerHead, {
        x: 0,
        y: -40
      });
    }
  },
  hardLandCD: 0,
  enterAir() {
    //triggered in engine.js on collision
    this.onGround = false;
    this.hardLandCD = 0 // disable hard landing
    if (this.isHeadClear) {
      if (this.crouch) {
        this.undoCrouch();
      }
      this.yOffGoal = this.yOffWhen.jump;
    }
  },
  //triggered in engine.js on collision
  enterLand() {
    this.onGround = true;
    if (this.crouch) {
      if (this.isHeadClear) {
        this.undoCrouch();
      } else {
        this.yOffGoal = this.yOffWhen.crouch;
      }
    } else {
      //sets a hard land where player stays in a crouch for a bit and can't jump
      //crouch is forced in keyMove() on ground section below
      const momentum = player.velocity.y * player.mass //player mass is 5 so this triggers at 20 down velocity, unless the player is holding something
      if (momentum > 100) {
        this.doCrouch();
        this.yOff = this.yOffWhen.jump;
        this.hardLandCD = mech.cycle + Math.min(momentum / 6 - 6, 40)
      } else {
        this.yOffGoal = this.yOffWhen.stand;
      }
    }
  },
  buttonCD_jump: 0, //cool down for player buttons
  keyMove() {
    if (this.onGround) { //on ground **********************
      if (this.crouch) {
        if (!(keys[83] || keys[40]) && this.isHeadClear && this.hardLandCD < mech.cycle) this.undoCrouch();
      } else if (keys[83] || keys[40] || this.hardLandCD > mech.cycle) {
        this.doCrouch(); //on ground && not crouched and pressing s or down
      } else if ((keys[87] || keys[38]) && this.buttonCD_jump + 20 < mech.cycle && this.yOffWhen.stand > 23) {
        this.buttonCD_jump = mech.cycle; //can't jump again until 20 cycles pass

        //apply a fraction of the jump force to the body the player is jumping off of
        Matter.Body.applyForce(mech.standingOn, mech.pos, {
          x: 0,
          y: this.jumpForce * 0.12 * Math.min(mech.standingOn.mass, 5)
        });

        player.force.y = -this.jumpForce; //player jump force
        Matter.Body.setVelocity(player, { //zero player y-velocity for consistent jumps
          x: player.velocity.x,
          y: 0
        });
      }

      //horizontal move on ground
      //apply a force to move
      if (keys[65] || keys[37]) { //left / a
        player.force.x -= this.Fx
        if (player.velocity.x > -2) player.force.x -= this.Fx * 0.5
      } else if (keys[68] || keys[39]) { //right / d
        player.force.x += this.Fx
        if (player.velocity.x < 2) player.force.x += this.Fx * 0.5
      } else {
        const stoppingFriction = 0.92;
        Matter.Body.setVelocity(player, {
          x: player.velocity.x * stoppingFriction,
          y: player.velocity.y * stoppingFriction
        });
      }
      //come to a stop if fast or if no move key is pressed
      if (player.speed > 4) {
        const stoppingFriction = (this.crouch) ? 0.65 : 0.89; // this controls speed when crouched
        Matter.Body.setVelocity(player, {
          x: player.velocity.x * stoppingFriction,
          y: player.velocity.y * stoppingFriction
        });
      }

    } else { // in air **********************************
      //check for short jumps
      if (
        this.buttonCD_jump + 60 > mech.cycle && //just pressed jump
        !(keys[87] || keys[38]) && //but not pressing jump key
        this.Vy < 0 //moving up
      ) {
        Matter.Body.setVelocity(player, {
          //reduce player y-velocity every cycle
          x: player.velocity.x,
          y: player.velocity.y * 0.94
        });
      }
      const limit = 125 / player.mass / player.mass
      if (keys[65] || keys[37]) {
        if (player.velocity.x > -limit) player.force.x -= this.FxAir; // move player   left / a
      } else if (keys[68] || keys[39]) {
        if (player.velocity.x < limit) player.force.x += this.FxAir; //move player  right / d
      }
    }

    //smoothly move leg height towards height goal
    this.yOff = this.yOff * 0.85 + this.yOffGoal * 0.15;
  },
  gamepadMove() {
    if (this.onGround) { //on ground **********************
      if (this.crouch) {
        if (game.gamepad.leftAxis.y !== -1 && this.isHeadClear && this.hardLandCD < mech.cycle) this.undoCrouch();
      } else if (game.gamepad.leftAxis.y === -1 || this.hardLandCD > mech.cycle) {
        this.doCrouch(); //on ground && not crouched and pressing s or down
      } else if (game.gamepad.jump && this.buttonCD_jump + 20 < mech.cycle && this.yOffWhen.stand > 23) {
        this.buttonCD_jump = mech.cycle; //can't jump again until 20 cycles pass

        //apply a fraction of the jump force to the body the player is jumping off of
        Matter.Body.applyForce(mech.standingOn, mech.pos, {
          x: 0,
          y: this.jumpForce * 0.12 * Math.min(mech.standingOn.mass, 5)
        });

        player.force.y = -this.jumpForce; //player jump force
        Matter.Body.setVelocity(player, { //zero player y-velocity for consistent jumps
          x: player.velocity.x,
          y: 0
        });
      }

      //horizontal move on ground
      //apply a force to move
      if (game.gamepad.leftAxis.x === -1) { //left / a
        player.force.x -= this.Fx
        if (player.velocity.x > -2) player.force.x -= this.Fx * 0.5
      } else if (game.gamepad.leftAxis.x === 1) { //right / d
        player.force.x += this.Fx
        if (player.velocity.x < 2) player.force.x += this.Fx * 0.5
      } else {
        const stoppingFriction = 0.92;
        Matter.Body.setVelocity(player, {
          x: player.velocity.x * stoppingFriction,
          y: player.velocity.y * stoppingFriction
        });
      }
      //come to a stop if fast or if no move key is pressed
      if (player.speed > 4) {
        const stoppingFriction = (this.crouch) ? 0.65 : 0.89;
        Matter.Body.setVelocity(player, {
          x: player.velocity.x * stoppingFriction,
          y: player.velocity.y * stoppingFriction
        });
      }

    } else { // in air **********************************
      //check for short jumps
      if (
        this.buttonCD_jump + 60 > mech.cycle && //just pressed jump
        !game.gamepad.jump && //but not pressing jump key
        this.Vy < 0 //moving up
      ) {
        Matter.Body.setVelocity(player, {
          //reduce player y-velocity every cycle
          x: player.velocity.x,
          y: player.velocity.y * 0.94
        });
      }
      const limit = 125 / player.mass / player.mass
      if (game.gamepad.leftAxis.x === -1) {
        if (player.velocity.x > -limit) player.force.x -= this.FxAir; // move player   left / a
      } else if (game.gamepad.leftAxis.x === 1) {
        if (player.velocity.x < limit) player.force.x += this.FxAir; //move player  right / d
      }
    }

    //smoothly move leg height towards height goal
    this.yOff = this.yOff * 0.85 + this.yOffGoal * 0.15;
  },
  alive: true,
  death() {
    if (b.modIsImmortal) { //if player has the immortality buff, spawn on the same level with randomized stats
      //remove mods
      b.setModDefaults();
      game.updateModHUD();
      spawn.setSpawnList(); //new mob types
      game.clearNow = true; //triggers a map reset

      function randomizeField() {
        if (game.levelsCleared > 5 && Math.random() < 0.9) {
          mech.fieldUpgrades[Math.floor(Math.random() * (mech.fieldUpgrades.length))].effect();
        } else {
          mech.fieldUpgrades[0].effect();
        }
      }

      function randomizeHealth() {
        mech.health = 0.5 + 0.5 * Math.random()
        mech.displayHealth();
      }

      function randomizeGuns() {
        b.activeGun = null;
        b.inventory = []; //removes guns and ammo  
        for (let i = 0, len = b.guns.length; i < len; ++i) {
          b.guns[i].have = false;
          if (b.guns[i].ammo !== Infinity) b.guns[i].ammo = 0;
        }
        if (game.levelsCleared > 0 && Math.random() < 0.95) powerUps.gun.effect();
        if (game.levelsCleared > 1 && Math.random() < 0.89) powerUps.gun.effect();
        if (game.levelsCleared > 3 && Math.random() < 0.6) powerUps.gun.effect();
        if (game.levelsCleared > 5 && Math.random() < 0.5) powerUps.gun.effect();
        if (game.levelsCleared > 7 && Math.random() < 0.4) powerUps.gun.effect();
        //randomize ammo
        for (let i = 0, len = b.inventory.length; i < len; i++) {
          if (b.guns[b.inventory[i]].ammo !== Infinity) {
            b.guns[b.inventory[i]].ammo = Math.max(0, Math.floor(2.2 * b.guns[b.inventory[i]].ammo * (Math.random() - 0.15)))
          }
        }
        game.makeGunHUD(); //update gun HUD
      }

      game.wipe = function () { //set wipe to have trails
        ctx.fillStyle = "rgba(255,255,255,0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      randomizeGuns()
      randomizeField()
      randomizeHealth()
      for (let i = 0; i < 7; i++) {
        setTimeout(function () {
          randomizeGuns()
          randomizeField()
          randomizeHealth()
          game.makeTextLog(`probability amplitude will synchronize in ${7-i} seconds`, 1000);
          game.wipe = function () { //set wipe to have trails
            ctx.fillStyle = `rgba(255,255,255,${(i+1)*(i+1)*0.003})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }, (i + 1) * 1000);
      }

      setTimeout(function () {
        game.wipe = function () { //set wipe to normal
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        game.makeTextLog("your quantum probability has stabilized", 1000);
        document.title = "n-gon: L" + (game.levelsCleared) + " " + level.levels[level.onLevel];
      }, 8000);

    } else if (this.alive) { //normal death code here
      this.alive = false;
      game.paused = true;
      this.health = 0;
      this.displayHealth();
      document.getElementById("text-log").style.opacity = 0; //fade out any active text logs
      document.getElementById("fade-out").style.opacity = 1; //slowly fades out
      setTimeout(function () {
        game.splashReturn();
      }, 5000);
    }
  },
  health: 0,
  // regen() {
  //   if (this.health < 1 && mech.cycle % 15 === 0) {
  //     this.addHealth(0.01);
  //   }
  // },
  drawHealth() {
    if (this.health < 1) {
      ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
      ctx.fillRect(this.pos.x - this.radius, this.pos.y - 50, 60, 10);
      ctx.fillStyle = "#f00";
      ctx.fillRect(
        this.pos.x - this.radius,
        this.pos.y - 50,
        60 * this.health,
        10
      );
    }
  },
  displayHealth() {
    id = document.getElementById("health");
    id.style.width = Math.floor(300 * this.health) + "px";
    //css animation blink if health is low
    if (this.health < 0.3) {
      id.classList.add("low-health");
    } else {
      id.classList.remove("low-health");
    }
  },
  addHealth(heal) {
    this.health += heal;
    if (this.health > 1) this.health = 1;
    this.displayHealth();
  },
  defaultFPSCycle: 0, //tracks when to return to normal fps
  damage(dmg) {
    this.health -= dmg;
    if (this.health < 0) {
      this.health = 0;
      this.death();
      return;
    }
    this.displayHealth();
    document.getElementById("dmg").style.transition = "opacity 0s";
    document.getElementById("dmg").style.opacity = 0.1 + Math.min(0.6, dmg * 4);

    //drop block if holding
    if (dmg > 0.07) {
      this.drop();
    }

    // freeze game and display a full screen red color
    if (dmg > 0.05) {
      game.fpsCap = 4 //40 - Math.min(25, 100 * dmg)
      game.fpsInterval = 1000 / game.fpsCap;
    } else {
      game.fpsCap = game.fpsCapDefault
      game.fpsInterval = 1000 / game.fpsCap;
    }
    mech.defaultFPSCycle = mech.cycle

    const normalFPS = function () {
      if (mech.defaultFPSCycle < mech.cycle) { //back to default values
        game.fpsCap = game.fpsCapDefault
        game.fpsInterval = 1000 / game.fpsCap;
        document.getElementById("dmg").style.transition = "opacity 1s";
        document.getElementById("dmg").style.opacity = "0";
      } else {
        requestAnimationFrame(normalFPS);
      }
    };
    requestAnimationFrame(normalFPS);
  },
  damageImmune: 0,
  hitMob(i, dmg) {
    //prevents damage happening too quick
  },
  buttonCD: 0, //cooldown for player buttons
  usePowerUp(i) {
    powerUp[i].effect();
    Matter.World.remove(engine.world, powerUp[i]);
    powerUp.splice(i, 1);
  },
  // *********************************************
  // **************** holding ********************
  // *********************************************
  closest: {
    dist: 1000,
    index: 0
  },
  isHolding: false,
  isStealth: false,
  throwCharge: 0,
  fireCDcycle: 0,
  fieldCDcycle: 0,
  fieldMode: 0, //basic field mode before upgrades
  // these values are set on reset by setHoldDefaults()
  fieldMeter: 0,
  fieldRegen: 0,
  fieldMode: 0,
  fieldFire: false,
  holdingMassScale: 0,
  throwChargeRate: 0,
  throwChargeMax: 0,
  fieldFireCD: 0,
  fieldDamage: 0,
  fieldShieldingScale: 0,
  grabRange: 0,
  fieldArc: 0,
  fieldThreshold: 0,
  calculateFieldThreshold() {
    this.fieldThreshold = Math.cos(this.fieldArc * Math.PI)
  },
  setHoldDefaults() {
    this.fieldMeter = 1;
    this.fieldRegen = 0.001;
    this.fieldFire = false;
    this.fieldCDcycle = 0;
    this.isStealth = false;
    player.collisionFilter.mask = 0x010011 //0x010011 is normal
    this.holdingMassScale = 0.5;
    this.throwChargeRate = 2;
    this.throwChargeMax = 50;
    this.fieldFireCD = 15;
    this.fieldDamage = 0; // a value of 1.0 kills a small mob in 2-3 hits on level 1
    this.fieldShieldingScale = 1; //scale energy loss after collision with mob
    this.grabRange = 175;
    this.fieldArc = 0.2;
    this.calculateFieldThreshold();
    this.jumpForce = 0.38;
    this.Fx = 0.015; //run Force on ground
    this.FxAir = 0.015; //run Force in Air
    this.gravity = 0.0019;
    mech.isBodiesAsleep = true;
    mech.wakeCheck();
    // this.phaseBlocks(0x011111)
  },
  drawFieldMeter(range = 60) {
    if (this.fieldMeter < 1) {
      mech.fieldMeter += mech.fieldRegen;
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(this.pos.x - this.radius, this.pos.y - 50, range, 10);
      ctx.fillStyle = "rgb(50,220,255)";
      ctx.fillRect(this.pos.x - this.radius, this.pos.y - 50, range * this.fieldMeter, 10);
    } else {
      mech.fieldMeter = 1
    }
  },
  lookingAt(who) {
    //calculate a vector from body to player and make it length 1
    const diff = Matter.Vector.normalise(Matter.Vector.sub(who.position, mech.pos));
    //make a vector for the player's direction of length 1
    const dir = {
      x: Math.cos(mech.angle),
      y: Math.sin(mech.angle)
    };
    //the dot product of diff and dir will return how much over lap between the vectors
    // console.log(Matter.Vector.dot(dir, diff))
    if (Matter.Vector.dot(dir, diff) > this.fieldThreshold) {
      return true;
    }
    return false;
  },
  drop() {
    if (this.isHolding) {
      this.isHolding = false;
      this.definePlayerMass()
      this.holdingTarget.collisionFilter.category = 0x010000;
      this.holdingTarget.collisionFilter.mask = 0x011111;
      this.holdingTarget = null;
      this.throwCharge = 0;
    }
  },
  drawHold(target, stroke = true) {
    const eye = 15;
    const len = target.vertices.length - 1;
    ctx.fillStyle = "rgba(110,170,200," + (0.2 + 0.4 * Math.random()) + ")";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(
      mech.pos.x + eye * Math.cos(this.angle),
      mech.pos.y + eye * Math.sin(this.angle)
    );
    ctx.lineTo(target.vertices[len].x, target.vertices[len].y);
    ctx.lineTo(target.vertices[0].x, target.vertices[0].y);
    ctx.fill();
    if (stroke) ctx.stroke();
    for (let i = 0; i < len; i++) {
      ctx.beginPath();
      ctx.moveTo(
        mech.pos.x + eye * Math.cos(this.angle),
        mech.pos.y + eye * Math.sin(this.angle)
      );
      ctx.lineTo(target.vertices[i].x, target.vertices[i].y);
      ctx.lineTo(target.vertices[i + 1].x, target.vertices[i + 1].y);
      ctx.fill();
      if (stroke) ctx.stroke();
    }
  },
  holding() {
    this.fieldMeter -= this.fieldRegen;
    if (this.fieldMeter < 0) this.fieldMeter = 0;
    Matter.Body.setPosition(this.holdingTarget, {
      x: mech.pos.x + 70 * Math.cos(this.angle),
      y: mech.pos.y + 70 * Math.sin(this.angle)
    });
    Matter.Body.setVelocity(this.holdingTarget, player.velocity);
    Matter.Body.rotate(this.holdingTarget, 0.01 / this.holdingTarget.mass); //gently spin the block
  },
  throw () {
    if ((keys[32] || game.mouseDownRight)) {
      if (this.fieldMeter > 0.002) {
        this.fieldMeter -= 0.002;
        this.throwCharge += this.throwChargeRate;;
        //draw charge
        const x = mech.pos.x + 15 * Math.cos(this.angle);
        const y = mech.pos.y + 15 * Math.sin(this.angle);
        const len = this.holdingTarget.vertices.length - 1;
        const edge = this.throwCharge * this.throwCharge * 0.02;
        const grd = ctx.createRadialGradient(x, y, edge, x, y, edge + 5);
        grd.addColorStop(0, "rgba(255,50,150,0.3)");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(this.holdingTarget.vertices[len].x, this.holdingTarget.vertices[len].y);
        ctx.lineTo(this.holdingTarget.vertices[0].x, this.holdingTarget.vertices[0].y);
        ctx.fill();
        for (let i = 0; i < len; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(this.holdingTarget.vertices[i].x, this.holdingTarget.vertices[i].y);
          ctx.lineTo(this.holdingTarget.vertices[i + 1].x, this.holdingTarget.vertices[i + 1].y);
          ctx.fill();
        }
      } else {
        this.drop()
      }
    } else if (this.throwCharge > 0) {
      //throw the body
      this.fireCDcycle = mech.cycle + this.fieldFireCD;
      this.isHolding = false;
      //bullet-like collisions
      this.holdingTarget.collisionFilter.category = 0x000100;
      this.holdingTarget.collisionFilter.mask = 0x110111;
      //check every second to see if player is away from thrown body, and make solid
      const solid = function (that) {
        const dx = that.position.x - player.position.x;
        const dy = that.position.y - player.position.y;
        if (dx * dx + dy * dy > 10000 && that.speed < 3 && that !== mech.holdingTarget) {
          that.collisionFilter.category = 0x010000; //make solid
          that.collisionFilter.mask = 0x011111;
        } else {
          setTimeout(solid, 50, that);
        }
      };
      setTimeout(solid, 400, this.holdingTarget);
      //throw speed scales a bit with mass
      const speed = Math.min(85, Math.min(54 / this.holdingTarget.mass + 5, 48) * Math.min(this.throwCharge, this.throwChargeMax) / 50);

      this.throwCharge = 0;
      Matter.Body.setVelocity(this.holdingTarget, {
        x: player.velocity.x + Math.cos(this.angle) * speed,
        y: player.velocity.y + Math.sin(this.angle) * speed
      });
      //player recoil //stronger in x-dir to prevent jump hacking
      Matter.Body.setVelocity(player, {
        x: player.velocity.x - Math.cos(this.angle) * speed / 20 * Math.sqrt(this.holdingTarget.mass),
        y: player.velocity.y - Math.sin(this.angle) * speed / 80 * Math.sqrt(this.holdingTarget.mass)
      });
      this.definePlayerMass() //return to normal player mass
    }
  },
  drawField() {
    //draw field
    const range = this.grabRange - 20;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, range, this.angle - Math.PI * this.fieldArc, this.angle + Math.PI * this.fieldArc, false);
    let eye = 13;
    ctx.lineTo(mech.pos.x + eye * Math.cos(this.angle), mech.pos.y + eye * Math.sin(this.angle));
    if (this.holdingTarget) {
      ctx.fillStyle = "rgba(110,170,200," + (0.05 + 0.1 * Math.random()) + ")";
    } else {
      ctx.fillStyle = "rgba(110,170,200," + (0.15 + 0.15 * Math.random()) + ")";
    }
    ctx.fill();
    //draw random lines in field for cool effect
    let offAngle = this.angle + 2 * Math.PI * this.fieldArc * (Math.random() - 0.5);
    ctx.beginPath();
    eye = 15;
    ctx.moveTo(mech.pos.x + eye * Math.cos(this.angle), mech.pos.y + eye * Math.sin(this.angle));
    ctx.lineTo(this.pos.x + range * Math.cos(offAngle), this.pos.y + range * Math.sin(offAngle));
    ctx.strokeStyle = "rgba(120,170,255,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  grabPowerUp() {
    //look for power ups to grab
    if (mech.fieldCDcycle < mech.cycle) {
      const grabPowerUpRange2 = (this.grabRange + 220) * (this.grabRange + 220)
      for (let i = 0, len = powerUp.length; i < len; ++i) {
        const dxP = mech.pos.x - powerUp[i].position.x;
        const dyP = mech.pos.y - powerUp[i].position.y;
        const dist2 = dxP * dxP + dyP * dyP;
        // float towards player  if looking at and in range  or  if very close to player
        if (dist2 < grabPowerUpRange2 && this.lookingAt(powerUp[i]) || dist2 < 16000) {
          if (dist2 < 5000) { //use power up if it is close enough
            Matter.Body.setVelocity(player, { //player knock back, after grabbing power up
              x: player.velocity.x + ((powerUp[i].velocity.x * powerUp[i].mass) / player.mass) * 0.3,
              y: player.velocity.y + ((powerUp[i].velocity.y * powerUp[i].mass) / player.mass) * 0.3
            });
            mech.usePowerUp(i);
            return;
          }
          this.fieldMeter -= this.fieldRegen * 0.5;
          powerUp[i].force.x += 7 * (dxP / dist2) * powerUp[i].mass;
          powerUp[i].force.y += 7 * (dyP / dist2) * powerUp[i].mass - powerUp[i].mass * game.g; //negate gravity
          //extra friction
          Matter.Body.setVelocity(powerUp[i], {
            x: powerUp[i].velocity.x * 0.11,
            y: powerUp[i].velocity.y * 0.11
          });
        }
      }
    }
  },
  pushMobs() {
    // push all mobs in range
    for (let i = 0, len = mob.length; i < len; ++i) {
      if (this.lookingAt(mob[i]) && Matter.Vector.magnitude(Matter.Vector.sub(mob[i].position, this.pos)) < this.grabRange && Matter.Query.ray(map, mob[i].position, this.pos).length === 0) {
        const fieldBlockCost = Math.max(0.02, mob[i].mass * 0.012) //0.012
        if (this.fieldMeter > fieldBlockCost) {
          this.fieldMeter -= fieldBlockCost * this.fieldShieldingScale;
          if (this.fieldMeter < 0) this.fieldMeter = 0;
          if (this.fieldDamage) mob[i].damage(b.dmgScale * this.fieldDamage);
          mob[i].locatePlayer();
          this.drawHold(mob[i]);
          //mob and player knock back
          const angle = Math.atan2(player.position.y - mob[i].position.y, player.position.x - mob[i].position.x);
          const mass = Math.min(Math.sqrt(mob[i].mass), 4);
          Matter.Body.setVelocity(mob[i], {
            x: player.velocity.x - (15 * Math.cos(angle)) / mass,
            y: player.velocity.y - (15 * Math.sin(angle)) / mass
          });
          Matter.Body.setVelocity(player, {
            x: player.velocity.x + 5 * Math.cos(angle) * mass,
            y: player.velocity.y + 5 * Math.sin(angle) * mass
          });
        }
      }
    }
  },
  pushMobs360(range = this.grabRange * 0.75) {
    // push all mobs in range
    for (let i = 0, len = mob.length; i < len; ++i) {
      if (Matter.Vector.magnitude(Matter.Vector.sub(mob[i].position, this.pos)) < range && Matter.Query.ray(map, mob[i].position, this.pos).length === 0) {
        const fieldBlockCost = Math.max(0.02, mob[i].mass * 0.012)
        if (this.fieldMeter > fieldBlockCost) {
          this.fieldMeter -= fieldBlockCost * this.fieldShieldingScale;
          if (this.fieldMeter < 0) this.fieldMeter = 0

          if (this.fieldDamage) mob[i].damage(b.dmgScale * this.fieldDamage);
          mob[i].locatePlayer();
          this.drawHold(mob[i]);
          //mob and player knock back
          const angle = Math.atan2(player.position.y - mob[i].position.y, player.position.x - mob[i].position.x);
          const mass = Math.min(Math.sqrt(mob[i].mass), 4);
          // console.log(mob[i].mass, Math.sqrt(mob[i].mass), mass)
          Matter.Body.setVelocity(mob[i], {
            x: player.velocity.x - (15 * Math.cos(angle)) / mass,
            y: player.velocity.y - (15 * Math.sin(angle)) / mass
          });
          Matter.Body.setVelocity(player, {
            x: player.velocity.x + 5 * Math.cos(angle) * mass,
            y: player.velocity.y + 5 * Math.sin(angle) * mass
          });
        }
      }
    }
  },
  lookForPickUp(range = this.grabRange) { //find body to pickup
    this.fieldMeter -= this.fieldRegen;
    const grabbing = {
      targetIndex: null,
      targetRange: range,
      // lookingAt: false //false to pick up object in range, but not looking at
    };
    for (let i = 0, len = body.length; i < len; ++i) {
      if (Matter.Query.ray(map, body[i].position, this.pos).length === 0) {
        //is this next body a better target then my current best
        const dist = Matter.Vector.magnitude(Matter.Vector.sub(body[i].position, this.pos));
        const looking = this.lookingAt(body[i]);
        // if (dist < grabbing.targetRange && (looking || !grabbing.lookingAt) && !body[i].isNotHoldable) {
        if (dist < grabbing.targetRange && looking && !body[i].isNotHoldable) {
          grabbing.targetRange = dist;
          grabbing.targetIndex = i;
          // grabbing.lookingAt = looking;
        }
      }
    }
    // set pick up target for when mouse is released
    if (body[grabbing.targetIndex]) {
      this.holdingTarget = body[grabbing.targetIndex];
      //
      ctx.beginPath(); //draw on each valid body
      let vertices = this.holdingTarget.vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      ctx.fillStyle = "rgba(190,215,230," + (0.3 + 0.7 * Math.random()) + ")";
      ctx.fill();

      ctx.globalAlpha = 0.2;
      this.drawHold(this.holdingTarget);
      ctx.globalAlpha = 1;
    } else {
      this.holdingTarget = null;
    }
  },
  pickUp() {
    //triggers when a hold target exits and field button is released
    this.isHolding = true;
    this.definePlayerMass(5 + this.holdingTarget.mass * this.holdingMassScale)
    //collide with nothing
    this.holdingTarget.collisionFilter.category = 0x000000;
    this.holdingTarget.collisionFilter.mask = 0x000000;
    // if (this.holdingTarget) {
    //   this.holdingTarget.collisionFilter.category = 0x010000;
    //   this.holdingTarget.collisionFilter.mask = 0x011111;
    // }
    // combine momentum   // this doesn't feel right in game
    // const px = player.velocity.x * player.mass + this.holdingTarget.velocity.x * this.holdingTarget.mass;
    // const py = player.velocity.y * player.mass + this.holdingTarget.velocity.y * this.holdingTarget.mass;
    // Matter.Body.setVelocity(player, {
    //   x: px / (player.mass + this.holdingTarget.mass),
    //   y: py / (player.mass + this.holdingTarget.mass)
    // });
  },
  wakeCheck() {
    if (mech.isBodiesAsleep) {
      mech.isBodiesAsleep = false;

      function wake(who) {
        for (let i = 0, len = who.length; i < len; ++i) {
          Matter.Sleeping.set(who[i], false)
          if (who[i].storeVelocity) {
            Matter.Body.setVelocity(who[i], {
              x: who[i].storeVelocity.x,
              y: who[i].storeVelocity.y
            })
            Matter.Body.setAngularVelocity(who[i], who[i].storeAngularVelocity)
          }
        }
      }
      wake(mob);
      wake(body);
      wake(bullet);
      for (let i = 0, len = cons.length; i < len; i++) {
        if (cons[i].stiffness === 0) {
          cons[i].stiffness = cons[i].storeStiffness
        }
      }
      // wake(powerUp);
    }
  },
  hold() {},
  fieldText() {
    game.makeTextLog(`<strong style='font-size:30px;'>${mech.fieldUpgrades[mech.fieldMode].name}</strong><br> <span class='faded'>(right click or space bar)</span><p>${mech.fieldUpgrades[mech.fieldMode].description}</p>`, 1200);
    document.getElementById("field").innerHTML = mech.fieldUpgrades[mech.fieldMode].name //add field
  },
  fieldUpgrades: [{
      name: "Field Emitter",
      description: "lets you <strong>pick up</strong> and throw objects<br><strong>shields</strong> you from damage",
      effect: () => {
        mech.fieldMode = 0;
        mech.fieldText();
        // game.makeTextLog("<strong style='font-size:30px;'></strong><br> <span class='faded'>(right click or space bar)</span><p></p>", 1200);
        mech.setHoldDefaults();
        mech.hold = function () {
          if (mech.isHolding) {
            mech.drawHold(mech.holdingTarget);
            mech.holding();
            mech.throw();
          } else if ((keys[32] || game.mouseDownRight && mech.fieldMeter > 0.1)) { //not hold but field button is pressed
            mech.drawField();
            mech.grabPowerUp();
            mech.pushMobs();
            mech.lookForPickUp();
          } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle && mech.fieldMeter > 0.05) { //holding, but field button is released
            mech.pickUp();
          } else {
            mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
          }
          mech.drawFieldMeter()
        }
      }
    },
    {
      name: "Time Dilation Field",
      description: "<strong>stop time</strong> while field is active<br> can fire while field is active",
      effect: () => {
        mech.fieldMode = 1;
        mech.fieldText();
        mech.setHoldDefaults();
        mech.fieldFire = true;
        mech.grabRange = 130
        mech.isBodiesAsleep = false;
        mech.hold = function () {
          if (mech.isHolding) {
            mech.wakeCheck();
            mech.drawHold(mech.holdingTarget);
            mech.holding();
            mech.throw();
          } else if ((keys[32] || game.mouseDownRight) && mech.fieldCDcycle < mech.cycle) {
            const DRAIN = 0.0027
            if (mech.fieldMeter > DRAIN) {
              mech.fieldMeter -= DRAIN;

              //draw field everywhere
              ctx.fillStyle = "rgba(110,170,200," + (0.19 + 0.16 * Math.random()) + ")";
              ctx.fillRect(-100000, -100000, 200000, 200000)

              //stop time
              mech.isBodiesAsleep = true;

              function sleep(who) {
                for (let i = 0, len = who.length; i < len; ++i) {
                  if (!who[i].isSleeping) {
                    who[i].storeVelocity = who[i].velocity
                    who[i].storeAngularVelocity = who[i].angularVelocity
                  }
                  Matter.Sleeping.set(who[i], true)
                }
              }
              sleep(mob);
              sleep(body);
              sleep(bullet);
              //doesn't really work, just slows down constraints
              for (let i = 0, len = cons.length; i < len; i++) {
                if (cons[i].stiffness !== 0) {
                  cons[i].storeStiffness = cons[i].stiffness;
                  cons[i].stiffness = 0;
                }
              }
              game.cycle--; //pause all functions that depend on game cycle increasing

              mech.grabPowerUp();
              mech.lookForPickUp(180);
            } else {
              mech.wakeCheck();
              mech.fieldCDcycle = mech.cycle + 120;
            }
          } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle && mech.fieldMeter > 0.05) { //holding, but field button is released
            mech.wakeCheck();
            mech.pickUp();
          } else {
            mech.wakeCheck();
            mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
          }
          mech.drawFieldMeter()
          if (mech.fieldMode !== 1) {
            //wake up if this is no longer the current field mode, like after a new power up
            mech.wakeCheck();

          }
        }
      }
    },
    {
      name: "Electrostatic Field",
      description: "field does <strong>damage</strong> on contact<br> blocks are thrown at a higher velocity<br> increased field regeneration",
      effect: () => {
        mech.fieldMode = 2;
        mech.fieldText();
        mech.setHoldDefaults();
        //throw quicker and harder
        mech.grabRange = 225;
        mech.fieldShieldingScale = 2;
        mech.fieldRegen *= 2;
        mech.throwChargeRate = 3;
        mech.throwChargeMax = 140;
        mech.fieldDamage = 5; //passive field does extra damage
        // mech.fieldArc = 0.11
        // mech.calculateFieldThreshold(); //run after setting fieldArc, used for powerUp grab and mobPush with lookingAt(mob)

        mech.hold = function () {
          if (mech.isHolding) {
            mech.drawHold(mech.holdingTarget);
            mech.holding();
            mech.throw();
          } else if ((keys[32] || game.mouseDownRight) && mech.fieldMeter > 0.15) { //not hold but field button is pressed
            //draw electricity
            const Dx = Math.cos(mech.angle);
            const Dy = Math.sin(mech.angle);
            let x = mech.pos.x + 20 * Dx;
            let y = mech.pos.y + 20 * Dy;
            ctx.beginPath();
            ctx.moveTo(x, y);
            for (let i = 0; i < 8; i++) {
              x += 18 * (Dx + 2 * (Math.random() - 0.5))
              y += 18 * (Dy + 2 * (Math.random() - 0.5))
              ctx.lineTo(x, y);
            }
            ctx.lineWidth = 1 //0.5 + 2 * Math.random();
            ctx.strokeStyle = `rgba(100,20,50,${0.5+0.5*Math.random()})`;
            ctx.stroke();

            //draw field
            const range = 170;
            const arc = Math.PI * 0.11
            ctx.beginPath();
            ctx.arc(mech.pos.x, mech.pos.y, range, mech.angle - arc, mech.angle + arc, false);
            ctx.lineTo(mech.pos.x + 13 * Math.cos(mech.angle), mech.pos.y + 13 * Math.sin(mech.angle));
            if (mech.holdingTarget) {
              ctx.fillStyle = "rgba(255,50,150," + (0.05 + 0.1 * Math.random()) + ")";
            } else {
              ctx.fillStyle = "rgba(255,50,150," + (0.13 + 0.18 * Math.random()) + ")";
            }
            ctx.fill();

            //draw random lines in field for cool effect
            // eye = 15;
            // ctx.beginPath();
            // ctx.moveTo(mech.pos.x + eye * Math.cos(mech.angle), mech.pos.y + eye * Math.sin(mech.angle));
            // const offAngle = mech.angle + 2 * Math.PI * mech.fieldArc * (Math.random() - 0.5);
            // ctx.lineTo(mech.pos.x + range * Math.cos(offAngle), mech.pos.y + range * Math.sin(offAngle));
            // ctx.strokeStyle = "rgba(100,20,50,0.2)";
            // ctx.stroke();

            mech.grabPowerUp();
            mech.pushMobs();
            mech.lookForPickUp();
          } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle && mech.fieldMeter > 0.05) { //holding, but field button is released
            mech.pickUp();
          } else {
            mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
          }
          mech.drawFieldMeter()
        }
      }
    },
    {
      name: "Negative Mass Field",
      description: "field nullifies <strong>gravity</strong><br> player can hold more massive objects<br>can fire while field is active",
      effect: () => {
        mech.fieldMode = 3;
        mech.fieldText();
        //<br> <span style='color:#a00;'>decreased</span> field shielding efficiency
        mech.setHoldDefaults();
        mech.fieldFire = true;
        mech.holdingMassScale = 0.05; //can hold heavier blocks with lower cost to jumping
        mech.fieldShieldingScale = 2;

        mech.hold = function () {
          if (mech.isHolding) {
            mech.drawHold(mech.holdingTarget);
            mech.holding();
            mech.throw();
          } else if ((keys[32] || game.mouseDownRight) && mech.fieldCDcycle < mech.cycle) { //push away
            const DRAIN = 0.0006
            if (mech.fieldMeter > DRAIN) {
              mech.pushMobs360(170);
              mech.grabPowerUp();
              mech.lookForPickUp(170);
              //look for nearby objects to make zero-g
              function zeroG(who, mag = 1.06) {
                for (let i = 0, len = who.length; i < len; ++i) {
                  sub = Matter.Vector.sub(who[i].position, mech.pos);
                  dist = Matter.Vector.magnitude(sub);
                  if (dist < mech.grabRange) {
                    who[i].force.y -= who[i].mass * (game.g * mag); //add a bit more then standard gravity
                  }
                }
              }
              // zeroG(bullet);  //works fine, but not that noticeable and maybe not worth the possible performance hit
              // zeroG(mob);  //mobs are too irregular to make this work?

              Matter.Body.setVelocity(player, {
                x: player.velocity.x,
                y: player.velocity.y * 0.97
              });

              if (keys[83] || keys[40]) { //down
                player.force.y -= 0.8 * player.mass * mech.gravity;
                mech.grabRange = mech.grabRange * 0.97 + 400 * 0.03;
                zeroG(powerUp, 0.85);
                zeroG(body, 0.85);
              } else if (keys[87] || keys[38]) { //up
                mech.fieldMeter -= 3 * DRAIN;
                mech.grabRange = mech.grabRange * 0.97 + 750 * 0.03;
                player.force.y -= 1.2 * player.mass * mech.gravity;
                zeroG(powerUp, 1.13);
                zeroG(body, 1.13);
              } else {
                mech.fieldMeter -= DRAIN;
                mech.grabRange = mech.grabRange * 0.97 + 650 * 0.03;
                player.force.y -= 1.07 * player.mass * mech.gravity; // slow upward drift
                zeroG(powerUp);
                zeroG(body);
              }

              //add extra friction for horizontal motion
              if (keys[65] || keys[68] || keys[37] || keys[39]) {
                Matter.Body.setVelocity(player, {
                  x: player.velocity.x * 0.85,
                  y: player.velocity.y
                });
              }

              //draw zero-G range
              ctx.beginPath();
              ctx.arc(mech.pos.x, mech.pos.y, mech.grabRange, 0, 2 * Math.PI);
              ctx.fillStyle = "#f5f5ff";
              ctx.globalCompositeOperation = "difference";
              ctx.fill();
              ctx.globalCompositeOperation = "source-over";
            } else {
              //trigger cool down
              mech.fieldCDcycle = mech.cycle + 120;
            }
          } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle && mech.fieldMeter > 0.05) { //holding, but field button is released
            mech.pickUp();
            mech.grabRange = 0
          } else {
            mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
            mech.grabRange = 0
          }
          mech.drawFieldMeter()
        }
      }
    },
    {
      name: "Standing Wave Harmonics",
      description: "oscillating shields always surround player<br> <span style='color:#a00;'>decreased</span> field regeneration",
      effect: () => {
        mech.fieldMode = 4;
        mech.fieldText();
        mech.setHoldDefaults();
        // mech.fieldShieldingScale = 0.5;
        mech.fieldRegen *= 0.2;

        mech.hold = function () {
          if (mech.isHolding) {
            mech.drawHold(mech.holdingTarget);
            mech.holding();
            mech.throw();
          } else if ((keys[32] || game.mouseDownRight && mech.fieldMeter > 0.1)) { //not hold but field button is pressed
            mech.grabPowerUp();
            mech.lookForPickUp(180);
          } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle) { //holding, but field button is released
            mech.pickUp();
          } else {
            mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
          }
          if (mech.fieldMeter > 0.1) {
            const grabRange1 = 90 + 60 * Math.sin(mech.cycle / 23)
            const grabRange2 = 85 + 70 * Math.sin(mech.cycle / 37)
            const grabRange3 = 80 + 80 * Math.sin(mech.cycle / 47)
            const netGrabRange = Math.max(grabRange1, grabRange2, grabRange3)
            ctx.fillStyle = "rgba(110,170,200," + (0.15 + 0.15 * Math.random()) + ")";
            ctx.beginPath();
            ctx.arc(mech.pos.x, mech.pos.y, grabRange1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mech.pos.x, mech.pos.y, grabRange2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mech.pos.x, mech.pos.y, grabRange3, 0, 2 * Math.PI);
            ctx.fill();
            mech.pushMobs360(netGrabRange);
          }
          mech.drawFieldMeter()
        }
      }
    },
    {
      name: "Nano-Scale Manufacturing",
      description: "excess field energy used to build <strong>drones</strong><br> increased field regeneration",
      effect: () => {
        mech.fieldMode = 5;
        mech.fieldText();
        mech.setHoldDefaults();
        mech.fieldRegen *= 3.5;
        mech.hold = function () {
          if (mech.fieldMeter === 1) {
            mech.fieldMeter -= 0.5;
            b.guns[12].fire() //spawn drone
          }
          if (mech.isHolding) {
            mech.drawHold(mech.holdingTarget);
            mech.holding();
            mech.throw();
          } else if ((keys[32] || game.mouseDownRight && mech.fieldMeter > 0.1)) { //not hold but field button is pressed
            mech.pushMobs();
            mech.drawField();
            mech.grabPowerUp();
            mech.lookForPickUp();
          } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle && mech.fieldMeter > 0.05) { //holding, but field button is released
            mech.pickUp();
          } else {
            mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
          }
          mech.drawFieldMeter()
        }
      }
    },
    {
      name: "Phase Decoherence Field",
      description: "<strong>intangible</strong> while field is active<br>can't see or be seen outside field",
      effect: () => {
        mech.fieldMode = 6;
        mech.fieldText();
        mech.setHoldDefaults();
        // mech.grabRange = 230
        mech.hold = function () {
          mech.isStealth = false //isStealth is checked in mob foundPlayer()
          player.collisionFilter.mask = 0x010011 //0x010011 is normal
          if (mech.isHolding) {
            mech.drawHold(mech.holdingTarget);
            mech.holding();
            mech.throw();
          } else if ((keys[32] || game.mouseDownRight) && mech.fieldCDcycle < mech.cycle) {
            const DRAIN = 0.002
            if (mech.fieldMeter > DRAIN) {
              mech.fieldMeter -= DRAIN;

              mech.isStealth = true //isStealth is checked in mob foundPlayer() 
              player.collisionFilter.mask = 0x000001 //0x010011 is normals

              ctx.beginPath();
              ctx.arc(mech.pos.x, mech.pos.y, mech.grabRange, 0, 2 * Math.PI);
              ctx.globalCompositeOperation = "destination-in"; //in or atop
              ctx.fillStyle = "rgba(255,255,255,0.25)";
              ctx.fill();
              ctx.globalCompositeOperation = "source-over";
              ctx.strokeStyle = "#000"
              ctx.lineWidth = 2;
              ctx.stroke();

              mech.grabPowerUp();
              mech.lookForPickUp(110);
            } else {
              mech.fieldCDcycle = mech.cycle + 120;
            }
          } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle && mech.fieldMeter > 0.05) { //holding, but field button is released
            mech.pickUp();
          } else {
            mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
          }
          mech.drawFieldMeter()
        }
      }
    },
    // () => {
    //   mech.fieldMode = 7;
    //   game.makeTextLog("<strong style='font-size:30px;'>Thermal Radiation Field</strong><br> <span class='faded'>(right click or space bar)</span> <p>field grows while active<br>damages all targets within range, <span style='color:#a00;'>including player</span><br> <span style='color:#a00;'>decreased</span> field shielding efficiency</p>", 1200);
    //   mech.setHoldDefaults();
    //   mech.fieldShieldingScale = 10;
    //   mech.rangeSmoothing = 0
    //   mech.hold = function () {
    //     if (mech.isHolding) {
    //       mech.drawHold(mech.holdingTarget);
    //       mech.holding();
    //       mech.throw();
    //     } else if ((keys[32] || game.mouseDownRight && mech.fieldCDcycle < mech.cycle)) { //not hold but field button is pressed
    //       mech.grabPowerUp();
    //       mech.lookForPickUp(Math.max(180, mech.grabRange));
    //       mech.pushMobs360(140);

    //       if (mech.health > 0.1) {
    //         const DRAIN = 0.0008 
    //         if (mech.fieldMeter > DRAIN) {
    //           mech.fieldMeter -= DRAIN;
    //           mech.damage(0.00005 + 0.00000012 * mech.grabRange)
    //           //draw damage field
    //           mech.grabRange = mech.grabRange * 0.997 + (1350 + 150 * Math.cos(mech.cycle / 30)) * 0.003
    //           let gradient = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, mech.grabRange);
    //           gradient.addColorStop(0, 'rgba(255,255,255,0.7)');
    //           gradient.addColorStop(1, 'rgba(255,0,50,' + (0.6 + 0.2 * Math.random()) + ')');

    //           const angleOff = 2 * Math.PI * Math.random()
    //           ctx.beginPath();
    //           ctx.arc(this.pos.x, this.pos.y, mech.grabRange + Math.sqrt(mech.grabRange) * 0.7 * (Math.random() - 0.5), angleOff, 1.8 * Math.PI + angleOff);
    //           ctx.fillStyle = gradient //rgba(255,0,0,0.2)
    //           ctx.fill();

    //           //damage and push away mobs in range
    //           for (let i = 0, len = mob.length; i < len; ++i) {
    //             if (mob[i].alive) {
    //               sub = Matter.Vector.sub(this.pos, mob[i].position);
    //               dist = Matter.Vector.magnitude(sub);
    //               if (dist < mech.grabRange) {
    //                 mob[i].damage(0.01);
    //                 mob[i].locatePlayer();
    //                 mob[i].force = Matter.Vector.mult(Matter.Vector.normalise(sub), -0.0001 * mob[i].mass) //gently push mobs back
    //               }
    //             }
    //           }
    //         } else {
    //           mech.fieldCDcycle = mech.cycle + 120;
    //         }
    //       } else {
    //         mech.grabRange = 180;
    //         mech.drawField();
    //         mech.grabPowerUp();
    //         mech.lookForPickUp();
    //       }
    //     } else if (mech.holdingTarget && mech.fireCDcycle < mech.cycle && mech.fieldMeter > 0.05) { //holding, but field button is released
    //       mech.grabRange = 0
    //       mech.pickUp();
    //     } else {
    //       mech.grabRange = 0
    //       mech.holdingTarget = null; //clears holding target (this is so you only pick up right after the field button is released and a hold target exists)
    //     }
    //     mech.drawFieldMeter()
    //   }
    // },
  ],
  drawLeg(stroke) {
    // if (game.mouseInGame.x > this.pos.x) {
    if (mech.angle > -Math.PI / 2 && mech.angle < Math.PI / 2) {
      this.flipLegs = 1;
    } else {
      this.flipLegs = -1;
    }
    ctx.save();
    ctx.scale(this.flipLegs, 1); //leg lines
    ctx.beginPath();
    ctx.moveTo(this.hip.x, this.hip.y);
    ctx.lineTo(this.knee.x, this.knee.y);
    ctx.lineTo(this.foot.x, this.foot.y);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 7;
    ctx.stroke();

    //toe lines
    ctx.beginPath();
    ctx.moveTo(this.foot.x, this.foot.y);
    ctx.lineTo(this.foot.x - 15, this.foot.y + 5);
    ctx.moveTo(this.foot.x, this.foot.y);
    ctx.lineTo(this.foot.x + 15, this.foot.y + 5);
    ctx.lineWidth = 4;
    ctx.stroke();

    //hip joint
    ctx.beginPath();
    ctx.arc(this.hip.x, this.hip.y, 11, 0, 2 * Math.PI);
    //knee joint
    ctx.moveTo(this.knee.x + 7, this.knee.y);
    ctx.arc(this.knee.x, this.knee.y, 7, 0, 2 * Math.PI);
    //foot joint
    ctx.moveTo(this.foot.x + 6, this.foot.y);
    ctx.arc(this.foot.x, this.foot.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },
  calcLeg(cycle_offset, offset) {
    this.hip.x = 12 + offset;
    this.hip.y = 24 + offset;
    //stepSize goes to zero if Vx is zero or not on ground (make this transition cleaner)
    this.stepSize = 0.8 * this.stepSize + 0.2 * (7 * Math.sqrt(Math.min(9, Math.abs(this.Vx))) * this.onGround);
    //changes to stepsize are smoothed by adding only a percent of the new value each cycle
    const stepAngle = 0.034 * this.walk_cycle + cycle_offset;
    this.foot.x = 2.2 * this.stepSize * Math.cos(stepAngle) + offset;
    this.foot.y = offset + 1.2 * this.stepSize * Math.sin(stepAngle) + this.yOff + this.height;
    const Ymax = this.yOff + this.height;
    if (this.foot.y > Ymax) this.foot.y = Ymax;

    //calculate knee position as intersection of circle from hip and foot
    const d = Math.sqrt((this.hip.x - this.foot.x) * (this.hip.x - this.foot.x) + (this.hip.y - this.foot.y) * (this.hip.y - this.foot.y));
    const l = (this.legLength1 * this.legLength1 - this.legLength2 * this.legLength2 + d * d) / (2 * d);
    const h = Math.sqrt(this.legLength1 * this.legLength1 - l * l);
    this.knee.x = (l / d) * (this.foot.x - this.hip.x) - (h / d) * (this.foot.y - this.hip.y) + this.hip.x + offset;
    this.knee.y = (l / d) * (this.foot.y - this.hip.y) + (h / d) * (this.foot.x - this.hip.x) + this.hip.y;
  },
  draw() {
    ctx.fillStyle = this.fillColor;
    this.walk_cycle += this.flipLegs * this.Vx;

    //draw body
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    this.calcLeg(Math.PI, -3);
    this.drawLeg("#4a4a4a");
    this.calcLeg(0, 0);
    this.drawLeg("#333");
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    let grd = ctx.createLinearGradient(-30, 0, 30, 0);
    grd.addColorStop(0, this.fillColorDark);
    grd.addColorStop(1, this.fillColor);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.arc(15, 0, 4, 0, 2 * Math.PI);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
    // ctx.beginPath();
    // ctx.arc(15, 0, 3, 0, 2 * Math.PI);
    // ctx.fillStyle = '#9cf' //'#0cf';
    // ctx.fill()
    ctx.restore();
  }
};