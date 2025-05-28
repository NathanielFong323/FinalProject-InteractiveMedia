class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
 }

  startGameLoop() {
    const step = () => {
      //Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Establish the camera person
      const cameraPerson = this.map.gameObjects.hero;

      //Update all objects
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })

      //Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })

      //Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);
      
      requestAnimationFrame(() => {
        step();   
      })
    }
    step();
 }

 bindActionInput() {
   new KeyPressListener("Enter", () => {
     //Is there a person here to talk to?
     this.map.checkForActionCutscene()
   })
 }

 bindHeroPositionCheck() {
   document.addEventListener("PersonWalkingComplete", e => {
     if (e.detail.whoId === "hero") {
       //Hero's position has changed
       this.map.checkForFootstepCutscene()
     }
   })
 }

 startMap(mapConfig="DemoRoom", heroInitialState=null) {
  this.map = new OverworldMap(mapConfig);
  this.map.overworld = this;
  this.map.mountObjects();

  if (heroInitialState) {
    this.map.gameObjects.hero.x = heroInitialState.x;
    this.map.gameObjects.hero.y = heroInitialState.y;
    this.map.gameObjects.hero.direction = heroInitialState.direction;
  }

  this.progress.mapId = mapConfig.id;
  this.progress.startingHeroX = this.map.gameObjects.hero.x;
  this.progress.startingHeroY = this.map.gameObjects.hero.y;
  this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
 }

 init() {
  this.progress = new Progress();
  let initialHeroState = null;
  const saveFile = this.progress.getSaveFile();
  if (saveFile) {
    this.progress.load();
    initialHeroState = {
      x: this.progress.startingHeroX,
      y: this.progress.startingHeroY,
      direction: this.progress.startingHeroDirection,
    }

  }
  var test = this.progress.mapId;
  this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

  console.log(`3: "${test}"`);
  var currentAudio = document.getElementById(test);
  currentAudio.volume = 0.2;
  const allAudioElements = document.querySelectorAll('audio');
  allAudioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });

  if (currentAudio) {
    currentAudio.play().catch(e => console.error("Play failed:", e));
  } else {
    console.warn(`Audio element with ID "${test}" not found.`);
  }

  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  this.startGameLoop();


  this.map.startCutscene([
  ])

 }
}