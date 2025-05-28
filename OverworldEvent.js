class OverworldEvent {
  constructor({progress, map, event}) {
    this.progress = progress;
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    
    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {

    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    })
    message.init(document.querySelector(".game-container") )
  }

  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map],
       {
         x: this.event.x,
         y: this.event.y,
         direction: this.event.direction,
       } 
      );
      resolve();
      sceneTransition.fadeOut();
    })
    
    console.log(this.event.map);

      var currentAudio = document.getElementById(this.event.map);
      currentAudio.volume = 0.2;
      console.log(this.event.map);
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      if (currentAudio) {
        currentAudio.play().catch(e => console.error("Play failed:", e));
      } else {
        console.warn(`Audio element with ID "${this.event.map}" not found.`);
      }


    this.progress = this.map.overworld.progress;
    this.progress.mapId = this.event.map;
    this.progress.startingHeroX = this.event.x;
    this.progress.startingHeroY = this.event.y;
    this.progress.startingHeroDirection = this.event.direction;
    this.progress.save();


  }

  changeLink(resolve) {
    var currentAudio = document.getElementById(this.event.map);
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    const changeLink = this.event.link;
    window.location.href = changeLink;
  }
  
  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}