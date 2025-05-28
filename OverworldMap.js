class OverworldMap {
  constructor(config) {

    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower_02.png",
    upperSrc: "/images/maps/DemoUpper_02.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(12),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand",  direction: "left", time: 800 },
          { type: "stand",  direction: "up", time: 800 },
          { type: "stand",  direction: "right", time: 1200 },
          { type: "stand",  direction: "up", time: 300 },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Welcome Brave Hero to this Fantastical World", faceHero: "npcA"},
              { type: "textMessage", text: "Or that's what I'd say if this is just another generic game..."},
              { type: "textMessage", text: "Anyway you are now in the mind of our creater"},
              { type: "textMessage", text: "Your task is to explore every corner of his mind"},
              { type: "textMessage", text: "Step out of this house to start your adventure!"},
              { type: "textMessage", text: "There is many secrets in this game, find 3 interation in this room!"},
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Nothing to see here", faceHero: "npcB" },
              { type: "textMessage", text: "Definitely nothing sus here..."},
            ]
          }
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(9),
        src: "/images/characters/people/Empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "(Seems like someone ate here...)", faceHero: "npcC" },
              { type: "textMessage", text: "(No matter, you are not invited anyway)"},
            ]
          }
        ]
      }),
      npcD: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(9),
        src: "/images/characters/people/Empty.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "(A jug of ... Vegemite?)", faceHero: "npcD" },
            ]
          }
        ]
      }),
    },
    walls: {
      [utils.asGridCoord(1,7)] : true,
      [utils.asGridCoord(1,11)] : true,
      [utils.asGridCoord(2,12)] : true,
      [utils.asGridCoord(3,12)] : true,
      [utils.asGridCoord(4,12)] : true,
      [utils.asGridCoord(5,12)] : true,
      [utils.asGridCoord(7,12)] : true,
      [utils.asGridCoord(8,12)] : true,
      [utils.asGridCoord(9,12)] : true,
      [utils.asGridCoord(10,12)] : true,
      [utils.asGridCoord(11,12)] : true,
      [utils.asGridCoord(12,2)] : true,
      [utils.asGridCoord(12,3)] : true,
      [utils.asGridCoord(12,4)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(12,11)] : true,
      [utils.asGridCoord(2,6)] : true,
      [utils.asGridCoord(3,6)] : true,
      [utils.asGridCoord(4,6)] : true,
      [utils.asGridCoord(2,8)] : true,
      [utils.asGridCoord(3,8)] : true,
      [utils.asGridCoord(4,8)] : true,
      [utils.asGridCoord(5,8)] : true,
      [utils.asGridCoord(2,9)] : true,
      [utils.asGridCoord(3,9)] : true,
      [utils.asGridCoord(4,9)] : true,
      [utils.asGridCoord(5,9)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,5)] : true,
      [utils.asGridCoord(6,5)] : true,
      [utils.asGridCoord(7,4)] : true,
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(9,4)] : true,
      [utils.asGridCoord(10,4)] : true,
      [utils.asGridCoord(6,13)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(6,12)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Main",
              x: utils.withGrid(6),
              y: utils.withGrid(8),
              direction: "up"
            }
          ]
        }
      ]
    }
    
  },
  Tram: {
    lowerSrc: "/images/maps/TramLower.png",
    upperSrc: "/images/maps/TramUpper.png",
    id: "Tram",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
      }),
      npcA: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Another day to work", faceHero:"npcA" },
              { type: "textMessage", text: "I wonder when Friday will come..."},
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(4),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Dont bother me!", faceHero:"npcB" },
              { type: "textMessage", text: "I am doom scrolling!"},
            ]
          }
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(16),
        y: utils.withGrid(6),
        src: "/images/characters/people/npc7.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Ye got a cig mate?", faceHero:"npcC" },
            ]
          }
        ]
      }),
      npcD: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(7),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "(Too focused on their phone)"},
              { type: "textMessage", text: "(Doesn't even realise they are blocking the door)"},
            ]
          }
        ]
      }),
      npcE: new Person({
        x: utils.withGrid(16),
        y: utils.withGrid(4),
        src: "/images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "walk",  direction: "down"},
          { type: "walk",  direction: "right"},
          { type: "walk",  direction: "right"},
          { type: "walk",  direction: "right"},
          { type: "walk",  direction: "up"},
          { type: "walk",  direction: "down"},
          { type: "walk",  direction: "left"},
          { type: "walk",  direction: "left"},
          { type: "walk",  direction: "left"},
          { type: "walk",  direction: "up"},
        ],
      }),
      npcF: new Person({
        x: utils.withGrid(21),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "HeEheehHEEhe", faceHero:"npcF"},
              { type: "textMessage", text: "(With a strong smell of alcohol) Ayee John"},
              { type: "textMessage", text: "Buuurrrp!! WHat'z upp mah mate"},
            ]
          }
        ]
      }),
      npcG: new Person({
        x: utils.withGrid(21),
        y: utils.withGrid(4),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "You need to get off the tram?", faceHero:"npcG"},
              { type: "textMessage", text: "Oi mate, stop blocking the door", faceHero:"npcG"},
              { who: "npcD", type: "walk",  direction: "up" },
              { who: "npcD", type: "walk",  direction: "left" },
            ]
          }
        ]
      }),
    },
    walls: {
      [utils.asGridCoord(1, 7)] : true,
      [utils.asGridCoord(2, 7)] : true,
      [utils.asGridCoord(3, 7)] : true,
      [utils.asGridCoord(4, 7)] : true,
      [utils.asGridCoord(5, 7)] : true,
      [utils.asGridCoord(6, 7)] : true,
      [utils.asGridCoord(7, 7)] : true,
      [utils.asGridCoord(8, 7)] : true,
      [utils.asGridCoord(9, 7)] : true,
      [utils.asGridCoord(10, 7)] : true,
      [utils.asGridCoord(12, 7)] : true,
      [utils.asGridCoord(13, 7)] : true,
      [utils.asGridCoord(14, 7)] : true,
      [utils.asGridCoord(15, 7)] : true,
      [utils.asGridCoord(16, 7)] : true,
      [utils.asGridCoord(17, 7)] : true,
      [utils.asGridCoord(18, 7)] : true,
      [utils.asGridCoord(19, 7)] : true,
      [utils.asGridCoord(20, 7)] : true,
      [utils.asGridCoord(21, 7)] : true,
      [utils.asGridCoord(0, 6)] : true,
      [utils.asGridCoord(0, 5)] : true,
      [utils.asGridCoord(0, 4)] : true,
      [utils.asGridCoord(1, 3)] : true,
      [utils.asGridCoord(2, 3)] : true,
      [utils.asGridCoord(3, 3)] : true,
      [utils.asGridCoord(4, 4)] : true,
      [utils.asGridCoord(5, 4)] : true,
      [utils.asGridCoord(6, 3)] : true,
      [utils.asGridCoord(7, 4)] : true,
      [utils.asGridCoord(8, 4)] : true,
      [utils.asGridCoord(9, 3)] : true,
      [utils.asGridCoord(10, 3)] : true,
      [utils.asGridCoord(11, 3)] : true,
      [utils.asGridCoord(12, 3)] : true,
      [utils.asGridCoord(13, 3)] : true,
      [utils.asGridCoord(14, 4)] : true,
      [utils.asGridCoord(15, 4)] : true,
      [utils.asGridCoord(16, 3)] : true,
      [utils.asGridCoord(17, 4)] : true,
      [utils.asGridCoord(18, 4)] : true,
      [utils.asGridCoord(19, 3)] : true,
      [utils.asGridCoord(20, 3)] : true,
      [utils.asGridCoord(21, 3)] : true,
      [utils.asGridCoord(22, 4)] : true,
      [utils.asGridCoord(22, 5)] : true,
      [utils.asGridCoord(22, 6)] : true,  
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,8)]: [
        {
          events: [
            { type: "changeMap", 
              map: "City",
              x: utils.withGrid(4),
              y: utils.withGrid(23),
              direction: "right"
            }
          ]
        }
      ]
    }
  },
  City: {
    lowerSrc: "/images/maps/CityFinalLower.png",
    upperSrc: "/images/maps/CityFinalUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
      }),
      npcA: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(19),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Woah.. Melbourne is so much more crowded from where I'm from", faceHero:"npcA" },
            ],
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(4),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Flinders?", faceHero:"npcB" },
              { type: "textMessage", text: "oh yeah it is right up ahead"},
              { type: "textMessage", text: "But you might wana explore around here"},
              { type: "textMessage", text: "Experience our creator's life around central"},
            ],
          }
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(12),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Man when's the tram coming", faceHero:"npcC" },
              { type: "textMessage", text: "It has areadly been 40 minutes"},
            ],
          }
        ]
      }),
      npcD: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(13),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Bloody tram, never on time", faceHero:"npcD" },
            ],
          }
        ]
      }),
      npcE: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(14),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "My destination is just one stop away", faceHero:"npcE" },
              { type: "textMessage", text: "But screw these guys"},
              { type: "textMessage", text: "I'm still gonna take the tram and not put my bag on the floor"},
              { type: "textMessage", text: "Then I take up the max space, so people who actually need to go home cant board!"},
            ],
          }
        ]
      }),
        npcF: new Person({
        x: utils.withGrid(18),
        y: utils.withGrid(7),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "hmrMarmsrmrrmmmmm", faceHero:"npcF" },
              { type: "textMessage", text: "Ye got a cig mate?"},
              { type: "textMessage", text: "arhrhhmmmmmrahhsrhh"},
              { type: "textMessage", text: "I heard someone passing them under a bridge around here... On the left side"},
            ],
          }
        ],
      }),
        npcG: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(16),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Ugh someone's vaping around here", faceHero:"npcG" },
            ],
          }
        ]
      }),
        npcH: new Person({
        x: utils.withGrid(34),
        y: utils.withGrid(24),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Aye mate, road word ahead", faceHero:"npcH" },
              { type: "textMessage", text: "you can't pass through here", faceHero:"npcH" },
            ],
          }
        ]
      }),
      npcI: new Person({
        x: utils.withGrid(33),
        y: utils.withGrid(7),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "我们稍后去吃什么"},
            ],
          }
        ],
        behaviorLoop: [
          {type:"stand", direction:"up"}
        ],
      }),
      npcJ: new Person({
        x: utils.withGrid(33),
        y: utils.withGrid(6),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "我认为我们应该先去购物"},
            ],
          }
        ],
        behaviorLoop: [
          {type:"stand", direction:"down"}
        ],
      }),
      npcK: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(1),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Aye mate, road word ahead", faceHero:"npcK" },
              { type: "textMessage", text: "Why is there so many road work you ask?"},
              { type: "textMessage", text: "Well it's Melbourne Central after all, what are you expecting?", faceHero:"npcH" },
            ],
          }
        ]
      }),
        npcL: new Person({
        x: utils.withGrid(18),
        y: utils.withGrid(3),
        src: "/images/characters/people/npc7.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Nice weather we have here in Melbourne right", faceHero:"npcL" },
              { type: "textMessage", text: "I heard it's gonna rain in 5 mins" },
              { type: "textMessage", text: "or in an hour, nobody knows"},
              { type: "textMessage", text: "Anyway let me take you to something fun"},
              { type: "changeLink", link: "AltLocation/hypnotic.html"}
            ],
          },
        ]
      }),
    },
    walls: {
      [utils.asGridCoord(3, 0)] : true,
      [utils.asGridCoord(3, 1)] : true,
      [utils.asGridCoord(3, 2)] : true,
      [utils.asGridCoord(3, 3)] : true,
      [utils.asGridCoord(3, 4)] : true,
      [utils.asGridCoord(3, 5)] : true,
      [utils.asGridCoord(3, 6)] : true,
      [utils.asGridCoord(3, 7)] : true,
      [utils.asGridCoord(3, 8)] : true,
      [utils.asGridCoord(3, 9)] : true,
      [utils.asGridCoord(3, 10)] : true,
      [utils.asGridCoord(3, 11)] : true,
      [utils.asGridCoord(3, 12)] : true,
      [utils.asGridCoord(3, 13)] : true,
      [utils.asGridCoord(3, 14)] : true,
      [utils.asGridCoord(3, 15)] : true,
      [utils.asGridCoord(3, 16)] : true,
      [utils.asGridCoord(3, 17)] : true,
      [utils.asGridCoord(3, 18)] : true,
      [utils.asGridCoord(3, 19)] : true,
      [utils.asGridCoord(3, 20)] : true,
      [utils.asGridCoord(3, 21)] : true,
      [utils.asGridCoord(3, 22)] : true,
      [utils.asGridCoord(3, 23)] : true,
      [utils.asGridCoord(3, 24)] : true, //
      [utils.asGridCoord(4,25)] : true,
      [utils.asGridCoord(5,25)] : true,
      [utils.asGridCoord(6,25)] : true,
      [utils.asGridCoord(7,25)] : true,
      [utils.asGridCoord(8,25)] : true,
      [utils.asGridCoord(9,25)] : true,
      [utils.asGridCoord(10,25)] : true,
      [utils.asGridCoord(11,25)] : true,
      [utils.asGridCoord(12,25)] : true,
      [utils.asGridCoord(13,25)] : true,
      [utils.asGridCoord(14,25)] : true,
      [utils.asGridCoord(15,25)] : true,
      [utils.asGridCoord(16,25)] : true,
      [utils.asGridCoord(17,25)] : true,
      [utils.asGridCoord(18,25)] : true,
      [utils.asGridCoord(19,25)] : true,
      [utils.asGridCoord(20,25)] : true,
      [utils.asGridCoord(21,25)] : true,
      [utils.asGridCoord(22,25)] : true,
      [utils.asGridCoord(23,25)] : true,
      [utils.asGridCoord(24,25)] : true,
      [utils.asGridCoord(25,25)] : true,
      [utils.asGridCoord(26,25)] : true,
      [utils.asGridCoord(27,25)] : true,
      [utils.asGridCoord(28,25)] : true,
      [utils.asGridCoord(29,25)] : true,
      [utils.asGridCoord(30,25)] : true,
      [utils.asGridCoord(31,25)] : true,
      [utils.asGridCoord(32,25)] : true,
      [utils.asGridCoord(33,25)] : true,//
      [utils.asGridCoord(34, 1)] : true,
      [utils.asGridCoord(34, 2)] : true,
      [utils.asGridCoord(34, 3)] : true,
      [utils.asGridCoord(34, 4)] : true,
      [utils.asGridCoord(34, 5)] : true,
      [utils.asGridCoord(34, 6)] : true,
      [utils.asGridCoord(34, 7)] : true,
      [utils.asGridCoord(34, 8)] : true,
      [utils.asGridCoord(34, 9)] : true,
      [utils.asGridCoord(34, 10)] : true,
      [utils.asGridCoord(34, 11)] : true,
      [utils.asGridCoord(34, 12)] : true,
      [utils.asGridCoord(34, 13)] : true,
      [utils.asGridCoord(34, 14)] : true,
      [utils.asGridCoord(34, 15)] : true,
      [utils.asGridCoord(34, 16)] : true,
      [utils.asGridCoord(34, 17)] : true,
      [utils.asGridCoord(34, 18)] : true,
      [utils.asGridCoord(34, 19)] : true,
      [utils.asGridCoord(34, 20)] : true,
      [utils.asGridCoord(34, 21)] : true,
      [utils.asGridCoord(34, 22)] : true,
      [utils.asGridCoord(34, 23)] : true,
      [utils.asGridCoord(34, 24)] : true,//
      [utils.asGridCoord(7, 3)] : true,
      [utils.asGridCoord(7, 4)] : true,
      [utils.asGridCoord(7, 5)] : true,
      [utils.asGridCoord(7, 6)] : true,
      [utils.asGridCoord(7, 7)] : true,
      [utils.asGridCoord(7, 8)] : true,
      [utils.asGridCoord(7, 9)] : true,
      [utils.asGridCoord(7, 10)] : true,
      [utils.asGridCoord(7, 11)] : true,
      [utils.asGridCoord(7, 12)] : true,
      [utils.asGridCoord(7, 13)] : true,
      [utils.asGridCoord(7, 14)] : true,
      [utils.asGridCoord(7, 15)] : true,
      [utils.asGridCoord(7, 16)] : true,
      [utils.asGridCoord(7, 17)] : true,
      [utils.asGridCoord(7, 18)] : true,
      [utils.asGridCoord(7, 19)] : true,
      [utils.asGridCoord(7, 20)] : true,
      [utils.asGridCoord(7, 21)] : true,
      [utils.asGridCoord(7, 22)] : true,
      [utils.asGridCoord(7, 23)] : true,//
      [utils.asGridCoord(17, 0)] : true,
      [utils.asGridCoord(17, 1)] : true,
      [utils.asGridCoord(17, 2)] : true,
      [utils.asGridCoord(17, 3)] : true,
      [utils.asGridCoord(17, 4)] : true,
      [utils.asGridCoord(17, 5)] : true,
      [utils.asGridCoord(17, 6)] : true,
      [utils.asGridCoord(17, 7)] : true,
      [utils.asGridCoord(17, 8)] : true,
      [utils.asGridCoord(17, 9)] : true,
      [utils.asGridCoord(17, 10)] : true,
      [utils.asGridCoord(17, 11)] : true,
      [utils.asGridCoord(17, 12)] : true,
      [utils.asGridCoord(17, 13)] : true,
      [utils.asGridCoord(17, 14)] : true,
      [utils.asGridCoord(17, 15)] : true,
      [utils.asGridCoord(17, 16)] : true,
      [utils.asGridCoord(17, 17)] : true,
      [utils.asGridCoord(17, 18)] : true,
      [utils.asGridCoord(17, 19)] : true,
      [utils.asGridCoord(17, 20)] : true,
      [utils.asGridCoord(17, 21)] : true,
      [utils.asGridCoord(17, 22)] : true,
      [utils.asGridCoord(17, 23)] : true,//
      [utils.asGridCoord(19, 5)] : true,
      [utils.asGridCoord(19, 6)] : true,
      [utils.asGridCoord(19, 7)] : true,
      [utils.asGridCoord(19, 8)] : true,
      [utils.asGridCoord(19, 9)] : true,
      [utils.asGridCoord(19, 10)] : true,
      [utils.asGridCoord(19, 11)] : true,
      [utils.asGridCoord(19, 12)] : true,
      [utils.asGridCoord(19, 13)] : true,
      [utils.asGridCoord(19, 14)] : true,
      [utils.asGridCoord(19, 15)] : true,
      [utils.asGridCoord(19, 16)] : true,
      [utils.asGridCoord(19, 17)] : true,
      [utils.asGridCoord(19, 18)] : true,
      [utils.asGridCoord(19, 19)] : true,
      [utils.asGridCoord(19, 20)] : true,
      [utils.asGridCoord(19, 21)] : true,
      [utils.asGridCoord(19, 22)] : true,
      [utils.asGridCoord(19, 23)] : true,//
      [utils.asGridCoord(31, 17)] : true,
      [utils.asGridCoord(31, 18)] : true,
      [utils.asGridCoord(31, 19)] : true,
      [utils.asGridCoord(31, 20)] : true,
      [utils.asGridCoord(31, 21)] : true,
      [utils.asGridCoord(31, 22)] : true,
      [utils.asGridCoord(31, 23)] : true,
      [utils.asGridCoord(30, 5)] : true,
      [utils.asGridCoord(30, 6)] : true,
      [utils.asGridCoord(30, 7)] : true,
      [utils.asGridCoord(30, 8)] : true,
      [utils.asGridCoord(30, 9)] : true,
      [utils.asGridCoord(30, 10)] : true,
      [utils.asGridCoord(30, 11)] : true,
      [utils.asGridCoord(30, 12)] : true,
      //[utils.asGridCoord(30, 13)] : true,
      [utils.asGridCoord(30, 14)] : true,
      [utils.asGridCoord(30, 15)] : true,
      [utils.asGridCoord(30, 16)] : true,//
      [utils.asGridCoord(8,23)] : true,
      [utils.asGridCoord(9,23)] : true,
      [utils.asGridCoord(10,23)] : true,
      [utils.asGridCoord(11,23)] : true,
      [utils.asGridCoord(12,23)] : true,
      [utils.asGridCoord(13,23)] : true,
      [utils.asGridCoord(14,23)] : true,
      [utils.asGridCoord(15,23)] : true,
      [utils.asGridCoord(16,23)] : true,
      [utils.asGridCoord(20,23)] : true,
      [utils.asGridCoord(21,23)] : true,
      [utils.asGridCoord(22,23)] : true,
      [utils.asGridCoord(23,23)] : true,
      [utils.asGridCoord(24,23)] : true,
      [utils.asGridCoord(25,23)] : true,
      [utils.asGridCoord(26,23)] : true,
      [utils.asGridCoord(27,23)] : true,
      [utils.asGridCoord(28,23)] : true,
      [utils.asGridCoord(29,23)] : true,
      [utils.asGridCoord(30,23)] : true,//
      [utils.asGridCoord(18,3)] : true,
      [utils.asGridCoord(19,3)] : true,
      [utils.asGridCoord(20,3)] : true,
      [utils.asGridCoord(21,3)] : true,
      [utils.asGridCoord(22,3)] : true,
      [utils.asGridCoord(23,3)] : true,
      [utils.asGridCoord(24,3)] : true,
      [utils.asGridCoord(25,3)] : true,
      [utils.asGridCoord(26,3)] : true,
      [utils.asGridCoord(27,3)] : true,
      [utils.asGridCoord(28,3)] : true,
      [utils.asGridCoord(29,3)] : true,
      [utils.asGridCoord(30,3)] : true,//
      [utils.asGridCoord(20,5)] : true,
      [utils.asGridCoord(21,5)] : true,
      [utils.asGridCoord(22,5)] : true,
      [utils.asGridCoord(23,5)] : true,
      [utils.asGridCoord(24,5)] : true,
      [utils.asGridCoord(25,5)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(27,5)] : true,
      [utils.asGridCoord(28,5)] : true,
      [utils.asGridCoord(29,5)] : true,//
      [utils.asGridCoord(8, 3)] : true,
      [utils.asGridCoord(9, 3)] : true,
      [utils.asGridCoord(10, 3)] : true,
      [utils.asGridCoord(11, 3)] : true,
      [utils.asGridCoord(12, 2)] : true,
      [utils.asGridCoord(12, 1)] : true,
      [utils.asGridCoord(13, 1)] : true,
      [utils.asGridCoord(14, 0)] : true,
      [utils.asGridCoord(18, 6)] : true,
      [utils.asGridCoord(30, 2)] : true,
      [utils.asGridCoord(30, 1)] : true,
      [utils.asGridCoord(31, 0)] : true,
      [utils.asGridCoord(32, 0)] : true,
      [utils.asGridCoord(33, 0)] : true,//
      [utils.asGridCoord(7,-1)] : true,
      [utils.asGridCoord(8,-1)] : true,
      [utils.asGridCoord(9,-1)] : true,
      [utils.asGridCoord(10,-1)] : true,
      [utils.asGridCoord(11,-1)] : true,
      [utils.asGridCoord(12,-1)] : true,
      [utils.asGridCoord(13,-1)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(4,-1)]: [
        {
          events: [
            { type: "changeMap", 
            map: "Flinders",
            x: utils.withGrid(52), //52,27
            y: utils.withGrid(27),
            direction: "up"
           }
          ]
        }
      ],
      [utils.asGridCoord(5,-1)]: [
        {
          events: [
            { type: "changeMap", 
            map: "Flinders",
            x: utils.withGrid(52), //52,27
            y: utils.withGrid(27),
            direction: "up"
           }
          ]
        }
      ],
      [utils.asGridCoord(6,-1)]: [
        {
          events: [
            { type: "changeMap", 
            map: "Flinders",
            x: utils.withGrid(52), //52,27
            y: utils.withGrid(27),
            direction: "up"
           }
          ]
        }
      ],
      [utils.asGridCoord(30,13)]: [
        {
          events: [
            { type: "changeLink", link: "AltLocation/moveButton.html"}
          ]
        }
      ],
    }
  },
  Flinders: {
  lowerSrc: "/images/maps/FlindersFinalLower.png",
  upperSrc: "/images/maps/FlindersFinalUpper.png",
  gameObjects: {
    hero: new Person({
      isPlayerControlled: true,
    }),
    npcA: new Person({
      x: utils.withGrid(6),
      y: utils.withGrid(19),
      direction: "left",
      src: "/images/characters/people/npc1.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "So many trams....", faceHero:"npcA" },
          ],
        }
      ]
    }),
    npcB: new Person({
      x: utils.withGrid(47),
      y: utils.withGrid(23),
      src: "/images/characters/people/npc1.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Welcome to Flinders", faceHero:"npcB" },
            { type: "textMessage", text: "If you head up, you will arrive at the SouthBank campus!", faceHero:"npcB" },
          ],
        }
      ]
    }),
    npcC: new Person({
      x: utils.withGrid(40),
      y: utils.withGrid(22),
      direction: "up",
      src: "/images/characters/people/npc2.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Ngl Flinders kinda smell", faceHero:"npcC" },
          ],
        }
      ]
    }),
    npcD: new Person({
      x: utils.withGrid(33),
      y: utils.withGrid(23),
      direction: "left",
      src: "/images/characters/people/npc3.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "hrrhdhdhdddhhhh", faceHero:"npcD" },
            { type: "textMessage", text: "Ye got a cig mate?" },
          ],
        }
      ]
    }),
    npcE: new Person({
      x: utils.withGrid(20),
      y: utils.withGrid(23),
      direction: "up",
      src: "/images/characters/people/erio.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Woah it's Flinders", faceHero:"npcE" },
            { type: "textMessage", text: "I really like it's architecture"},
          ],
        }
      ]
    }),
    npcF: new Person({
      x: utils.withGrid(19),
      y: utils.withGrid(22),
      direction: "up",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Even though I have been here for 3 years", faceHero:"npcF" },
            { type: "textMessage", text: "Flinders' still stunning everytime I see it"},
          ],
        }
      ]
    }),
    npcG: new Person({
      x: utils.withGrid(43),
      y: utils.withGrid(27),
      direction: "up",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Why there's so many trams on Swanstons", faceHero:"npcG" },
            { type: "textMessage", text: "But not one ever arrives here at Collins?"},
          ],
        }
      ]
    }),
    npcH: new Person({
      x: utils.withGrid(42),
      y: utils.withGrid(27),
      direction: "up",
      src: "/images/characters/people/erio.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "I just wana get to Fitzroy Gardon", faceHero:"npcH" },
            { type: "textMessage", text: "Might be quicker to walk there than wait for a tram here"},
          ],
        }
      ]
    }),
    npcI: new Person({
      x: utils.withGrid(40),
      y: utils.withGrid(27),
      direction: "up",
      src: "/images/characters/people/npc3.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "I've been sitting here for 20 mins", faceHero:"npcI" },
            { type: "textMessage", text: "When's the tram coming..."},
          ],
        }
      ]
    }),
    npcJ: new Person({
      x: utils.withGrid(38),
      y: utils.withGrid(27),
      direction: "up",
      src: "/images/characters/people/npc1.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Can't wait to take the old trams", faceHero:"npcJ" },
            { type: "textMessage", text: "I heard the city loop is really cool"},
          ],
        }
      ]
    }),
    npcK: new Person({
      x: utils.withGrid(27),
      y: utils.withGrid(25),
      direction: "left",
      src: "/images/characters/people/npc2.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Road Work ahead", faceHero:"npcK" },
            { type: "textMessage", text: "Tram aren't coming for at least another hour mate"},
          ],
        }
      ]
    }),
    npcL: new Person({
      x: utils.withGrid(13),
      y: utils.withGrid(18),
      direction: "right",
      src: "/images/characters/people/npc2.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Woahh.. it's the Flinders I read online before coming here", faceHero:"npcL" },
            { type: "textMessage", text: "Let's take some pictures!"},
          ],
        }
      ]
    }),
    npcM: new Person({
      x: utils.withGrid(15),
      y: utils.withGrid(20),
      direction: "right",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "So cool", faceHero:"npcM" },
            { type: "textMessage", text: "Let's take some pictures!"},
          ],
        }
      ]
    }),
    npcN: new Person({
      x: utils.withGrid(11),
      y: utils.withGrid(16),
      direction: "left",
      src: "/images/characters/people/erio.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "If only Flinders aren't so crowded", faceHero:"npcN" },
          ],
        }
      ]
    }),
    npcO: new Person({
      x: utils.withGrid(11),
      y: utils.withGrid(13),
      direction: "left",
      src: "/images/characters/people/npc2.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Get some Pizzas here, they are real good!", faceHero:"npcO" },
          ],
        }
      ]
    }),
    npcP: new Person({
      x: utils.withGrid(11),
      y: utils.withGrid(8),
      direction: "left",
      src: "/images/characters/people/npc3.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Get some sushi here", faceHero:"npcP" },
            { type: "textMessage", text: "(They aren't that good actually...)"},
          ],
        }
      ]
    }),
    npcQ: new Person({
      x: utils.withGrid(0),
      y: utils.withGrid(11),
      direction: "right",
      src: "/images/characters/people/npc3.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "On my way to NGV, can't wait!", faceHero:"npcQ" },
          ],
        }
      ]
    }),
    npcR: new Person({
      x: utils.withGrid(0),
      y: utils.withGrid(8),
      direction: "right",
      src: "/images/characters/people/erio.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "With so many trams, I'll never be late to class!", faceHero:"npcR" },
          ],
        }
      ]
    }),
    npcS: new Person({
      x: utils.withGrid(0),
      y: utils.withGrid(5),
      direction: "right",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Passengers, this tram will go straight,", faceHero:"npcS" },
            { type: "textMessage", text: "You can get to St. Kilda from here"},
          ],
        }
      ]
    }),
    npcT: new Person({
      x: utils.withGrid(1),
      y: utils.withGrid(0),
      src: "/images/characters/people/npc1.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Hey man, you know where's the best place for Italian food?", faceHero:"npcT" },
            { type: "textMessage", text: "Lygon Street? Thx man" },
            { type: "textMessage", text: "As thanks, Let me take you to somewhere fun"},
            { type: "changeLink", link: "AltLocation/hypnotic.html"}
          ],
        },
      ]
    }),
  },
  walls: {
    [utils.asGridCoord(3, 0)] : true,
    [utils.asGridCoord(3, 1)] : true,
    [utils.asGridCoord(3, 2)] : true,
    [utils.asGridCoord(3, 3)] : true,
    [utils.asGridCoord(3, 4)] : true,
    [utils.asGridCoord(3, 5)] : true,
    [utils.asGridCoord(3, 6)] : true,
    [utils.asGridCoord(3, 7)] : true,
    [utils.asGridCoord(3, 8)] : true,
    [utils.asGridCoord(3, 9)] : true,
    [utils.asGridCoord(3, 10)] : true,
    [utils.asGridCoord(3, 11)] : true,
    [utils.asGridCoord(3, 12)] : true,
    [utils.asGridCoord(3, 13)] : true,
    [utils.asGridCoord(3, 14)] : true,
    [utils.asGridCoord(3, 15)] : true,
    [utils.asGridCoord(3, 16)] : true,
    [utils.asGridCoord(3, 17)] : true,
    [utils.asGridCoord(3, 18)] : true,//
    [utils.asGridCoord(4, 0)] : true,
    [utils.asGridCoord(4, 1)] : true,
    [utils.asGridCoord(4, 2)] : true,
    [utils.asGridCoord(4, 3)] : true,
    [utils.asGridCoord(4, 4)] : true,
    [utils.asGridCoord(4, 5)] : true,
    [utils.asGridCoord(4, 6)] : true,
    [utils.asGridCoord(4, 7)] : true,
    [utils.asGridCoord(4, 8)] : true,
    [utils.asGridCoord(4, 9)] : true,
    [utils.asGridCoord(4, 10)] : true,
    [utils.asGridCoord(4, 11)] : true,
    [utils.asGridCoord(4, 12)] : true,
    [utils.asGridCoord(4, 13)] : true,
    [utils.asGridCoord(4, 14)] : true,
    [utils.asGridCoord(4, 15)] : true,
    [utils.asGridCoord(4, 16)] : true,
    [utils.asGridCoord(4, 17)] : true,
    [utils.asGridCoord(4, 18)] : true,//
    [utils.asGridCoord(3, 24)] : true,
    [utils.asGridCoord(3, 25)] : true,
    [utils.asGridCoord(3, 26)] : true,
    [utils.asGridCoord(3, 27)] : true,//
    [utils.asGridCoord(4, 24)] : true,
    [utils.asGridCoord(4, 25)] : true,
    [utils.asGridCoord(4, 26)] : true,
    [utils.asGridCoord(4, 27)] : true,//
    [utils.asGridCoord(16, 0)] : true,
    [utils.asGridCoord(16, 1)] : true,
    [utils.asGridCoord(16, 2)] : true,
    [utils.asGridCoord(16, 3)] : true,
    [utils.asGridCoord(16, 4)] : true,
    [utils.asGridCoord(16, 5)] : true,
    [utils.asGridCoord(16, 6)] : true,
    [utils.asGridCoord(16, 7)] : true,
    [utils.asGridCoord(16, 8)] : true,
    [utils.asGridCoord(16, 9)] : true,
    [utils.asGridCoord(16, 10)] : true,
    [utils.asGridCoord(16, 11)] : true,
    [utils.asGridCoord(16, 12)] : true,
    [utils.asGridCoord(16, 13)] : true,//
    [utils.asGridCoord(23,21)] : true,
    [utils.asGridCoord(24,21)] : true,
    [utils.asGridCoord(25,21)] : true,
    [utils.asGridCoord(26,21)] : true,
    [utils.asGridCoord(27,21)] : true,
    [utils.asGridCoord(28,21)] : true,
    [utils.asGridCoord(29,21)] : true,
    [utils.asGridCoord(30,21)] : true,
    [utils.asGridCoord(31,21)] : true,
    [utils.asGridCoord(32,21)] : true,
    [utils.asGridCoord(33,21)] : true,
    [utils.asGridCoord(34,21)] : true,
    [utils.asGridCoord(35,21)] : true,
    [utils.asGridCoord(36,21)] : true,
    [utils.asGridCoord(37,21)] : true,
    [utils.asGridCoord(38,21)] : true,
    [utils.asGridCoord(39,21)] : true,
    [utils.asGridCoord(40,21)] : true,
    [utils.asGridCoord(41,21)] : true,
    [utils.asGridCoord(42,21)] : true,
    [utils.asGridCoord(43,21)] : true,
    [utils.asGridCoord(44,21)] : true,
    [utils.asGridCoord(45,21)] : true,
    [utils.asGridCoord(46,21)] : true,
    [utils.asGridCoord(47,21)] : true,
    [utils.asGridCoord(48,21)] : true,
    [utils.asGridCoord(49,21)] : true,
    [utils.asGridCoord(50,21)] : true,
    [utils.asGridCoord(51,21)] : true,
    [utils.asGridCoord(52,21)] : true,
    [utils.asGridCoord(53,21)] : true,
    [utils.asGridCoord(54,21)] : true,
    [utils.asGridCoord(55,21)] : true,//
    [utils.asGridCoord(17, 14)] : true,
    [utils.asGridCoord(17, 15)] : true,
    [utils.asGridCoord(17, 16)] : true,
    [utils.asGridCoord(18, 16)] : true,
    [utils.asGridCoord(21, 18)] : true,
    [utils.asGridCoord(21, 19)] : true,
    [utils.asGridCoord(21, 20)] : true,
    [utils.asGridCoord(22, 20)] : true,//
    [utils.asGridCoord(-1, 0)] : true,
    [utils.asGridCoord(-1, 1)] : true,
    [utils.asGridCoord(-1, 2)] : true,
    [utils.asGridCoord(-1, 3)] : true,
    [utils.asGridCoord(-1, 4)] : true,
    [utils.asGridCoord(-1, 5)] : true,
    [utils.asGridCoord(-1, 6)] : true,
    [utils.asGridCoord(-1, 7)] : true,
    [utils.asGridCoord(-1, 8)] : true,
    [utils.asGridCoord(-1, 9)] : true,
    [utils.asGridCoord(-1, 10)] : true,
    [utils.asGridCoord(-1, 11)] : true,
    [utils.asGridCoord(-1, 12)] : true,
    [utils.asGridCoord(-1, 13)] : true,
    [utils.asGridCoord(-1, 14)] : true,
    [utils.asGridCoord(-1, 15)] : true,
    [utils.asGridCoord(-1, 16)] : true,
    [utils.asGridCoord(-1, 17)] : true,
    [utils.asGridCoord(-1, 18)] : true,
    [utils.asGridCoord(-1, 19)] : true,
    [utils.asGridCoord(-1, 20)] : true,
    [utils.asGridCoord(-1, 21)] : true,
    [utils.asGridCoord(-1, 22)] : true,
    [utils.asGridCoord(-1, 23)] : true,
    [utils.asGridCoord(-1, 24)] : true,
    [utils.asGridCoord(-1, 25)] : true,
    [utils.asGridCoord(-1, 26)] : true,
    [utils.asGridCoord(-1, 27)] : true,//
    [utils.asGridCoord(0,28)] : true,
    [utils.asGridCoord(1,28)] : true,
    [utils.asGridCoord(2,28)] : true,
    [utils.asGridCoord(3,28)] : true,
    [utils.asGridCoord(4,28)] : true,
    [utils.asGridCoord(5,28)] : true,
    [utils.asGridCoord(6,28)] : true,
    [utils.asGridCoord(7,28)] : true,
    [utils.asGridCoord(8,28)] : true,
    [utils.asGridCoord(9,28)] : true,
    [utils.asGridCoord(10,28)] : true,
    [utils.asGridCoord(11,28)] : true,
    [utils.asGridCoord(12,28)] : true,
    [utils.asGridCoord(13,28)] : true,
    [utils.asGridCoord(14,28)] : true,
    [utils.asGridCoord(15,28)] : true,
    [utils.asGridCoord(16,28)] : true,
    [utils.asGridCoord(17,28)] : true,
    [utils.asGridCoord(18,28)] : true,
    [utils.asGridCoord(19,28)] : true,
    [utils.asGridCoord(20,28)] : true,
    [utils.asGridCoord(21,28)] : true,
    [utils.asGridCoord(22,28)] : true,
    [utils.asGridCoord(23,28)] : true,
    [utils.asGridCoord(24,28)] : true,
    [utils.asGridCoord(25,28)] : true,
    [utils.asGridCoord(26,28)] : true,
    [utils.asGridCoord(27,28)] : true,
    [utils.asGridCoord(28,28)] : true,
    [utils.asGridCoord(29,28)] : true,
    [utils.asGridCoord(30,28)] : true,
    [utils.asGridCoord(31,28)] : true,
    [utils.asGridCoord(32,28)] : true,
    [utils.asGridCoord(33,28)] : true,
    [utils.asGridCoord(34,28)] : true,
    [utils.asGridCoord(35,28)] : true,
    [utils.asGridCoord(36,28)] : true,
    [utils.asGridCoord(37,28)] : true,
    [utils.asGridCoord(38,28)] : true,
    [utils.asGridCoord(39,28)] : true,
    [utils.asGridCoord(40,28)] : true,
    [utils.asGridCoord(41,28)] : true,
    [utils.asGridCoord(42,28)] : true,
    [utils.asGridCoord(43,28)] : true,
    [utils.asGridCoord(44,28)] : true,
    [utils.asGridCoord(45,28)] : true,
    [utils.asGridCoord(46,28)] : true,
    [utils.asGridCoord(47,28)] : true,
    [utils.asGridCoord(48,28)] : true,
    [utils.asGridCoord(49,28)] : true,
    [utils.asGridCoord(50,28)] : true,
    [utils.asGridCoord(51,28)] : true,
    [utils.asGridCoord(52,28)] : true,
    [utils.asGridCoord(53,28)] : true,
    [utils.asGridCoord(54,28)] : true,
    [utils.asGridCoord(55,28)] : true,//
    [utils.asGridCoord(55, 22)] : true,
    [utils.asGridCoord(55, 23)] : true,
    [utils.asGridCoord(55, 24)] : true,
    [utils.asGridCoord(55, 25)] : true,
    [utils.asGridCoord(55, 26)] : true,
    [utils.asGridCoord(55, 27)] : true,//
    [utils.asGridCoord(0,-1)] : true,
    [utils.asGridCoord(1,-1)] : true,
    [utils.asGridCoord(2,-1)] : true,
    [utils.asGridCoord(3,-1)] : true,
    [utils.asGridCoord(4,-1)] : true,
    [utils.asGridCoord(5,-1)] : true,
    [utils.asGridCoord(6,-1)] : true,
    [utils.asGridCoord(7,-1)] : true,
    [utils.asGridCoord(8,-1)] : true,
    [utils.asGridCoord(9,-1)] : true,
    [utils.asGridCoord(10,-1)] : true,
    [utils.asGridCoord(11,-1)] : true,
    [utils.asGridCoord(12,-1)] : true,
  },
  cutsceneSpaces: {
    [utils.asGridCoord(13,-1)]: [
      {
        events: [
          { type: "changeMap", 
          map: "Lift",
          x: utils.withGrid(1),
          y: utils.withGrid(2),
          direction: "down"
         }
        ]
      }
    ],
    [utils.asGridCoord(14,-1)]: [
      {
        events: [
          { type: "changeMap", 
          map: "Lift",
          x: utils.withGrid(1),
          y: utils.withGrid(2),
          direction: "down"
         }
        ]
      }
    ],
    [utils.asGridCoord(15,-1)]: [
      {
        events: [
          { type: "changeMap", 
          map: "Lift",
          x: utils.withGrid(1),
          y: utils.withGrid(2),
          direction: "down"
         }
        ]
      }
    ],
    [utils.asGridCoord(19,16)]: [
        {
          events: [
            { type: "changeLink", link: "AltLocation/errorScreen.html"},
          ],
        }
      ],
    [utils.asGridCoord(20,17)]: [
        {
          events: [
            { type: "changeLink", link: "AltLocation/errorScreen.html"},
          ],
        }
      ],
    }
  },
  Lift: {
  lowerSrc: "/images/maps/Lift.png",
  upperSrc: "",
  gameObjects: {
    hero: new Person({
      isPlayerControlled: true,
    }),
    npcA: new Person({
      x: utils.withGrid(2),
      y: utils.withGrid(3),
      direction: "left",
      src: "/images/characters/people/npc1.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "So you made it", faceHero:"npcA" },
            { type: "textMessage", text: "Now you have experience our creator's daily commute to school"},
            { type: "textMessage", text: "Some of the people you talked to is what he experienced and rememberd the most"},
            { type: "textMessage", text: "The wierd spaces you go to are some of his day dreams on the way"},
            { type: "textMessage", text: "Anyway, let me take you back to his main mind"},
            { type: "textMessage", text: "You can explore more there!"},
            { type: "changeMap", 
              map: "Main",
              x: utils.withGrid(7),
              y: utils.withGrid(6),
              direction: "down"
            }
          ],
        }
      ]
    }),
  },
  walls: {
    [utils.asGridCoord(0, 2)] : true,
    [utils.asGridCoord(0, 3)] : true,
    [utils.asGridCoord(3, 2)] : true,
    [utils.asGridCoord(3, 2)] : true,
    [utils.asGridCoord(1, 1)] : true,
    [utils.asGridCoord(2, 1)] : true,
    [utils.asGridCoord(1, 4)] : true,
    [utils.asGridCoord(2, 4)] : true,
  },
  cutsceneSpaces: {
    }
  },
  Main: {
  lowerSrc: "/images/maps/Mind.png",
  upperSrc: "",
  gameObjects: {
    hero: new Person({
      isPlayerControlled: true,
    }),
    npcA: new Person({
      x: utils.withGrid(1),
      y: utils.withGrid(3),
      direction: "right",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "So you made it", faceHero:"npcA" },
          ],
        }
      ]
    }),
    npcB: new Person({
      x: utils.withGrid(7),
      y: utils.withGrid(1),
      direction: "down",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Enter here to experience the daily commute of our creator", faceHero:"npcB" },
            { type: "textMessage", text: "You will see his deepest impressions from his travels"},
            { type: "textMessage", text: "You might be able to find some of his day dreams if you explore a bit..."},
          ],
        }
      ]
    }),
    npcC: new Person({
      x: utils.withGrid(11),
      y: utils.withGrid(5),
      direction: "left",
      src: "/images/characters/people/npc7.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "Inside is a gallery", faceHero:"npcC" },
            { type: "textMessage", text: "Where you can explore our creator's belongings"},
          ],
        }
      ]
    }),
  },
  walls: {
    [utils.asGridCoord(0, 0)] : true,
    [utils.asGridCoord(0, 1)] : true,
    [utils.asGridCoord(0, 2)] : true,
    [utils.asGridCoord(0, 3)] : true,
    [utils.asGridCoord(0, 5)] : true,
    [utils.asGridCoord(0, 6)] : true,
    [utils.asGridCoord(0, 7)] : true,//
    [utils.asGridCoord(12, 0)] : true,
    [utils.asGridCoord(12, 1)] : true,
    [utils.asGridCoord(12, 2)] : true,
    [utils.asGridCoord(12, 3)] : true,
    [utils.asGridCoord(12, 5)] : true,
    [utils.asGridCoord(12, 6)] : true,
    [utils.asGridCoord(12, 7)] : true,//
    [utils.asGridCoord(1,0)] : true,
    [utils.asGridCoord(2,0)] : true,
    [utils.asGridCoord(3,0)] : true,
    [utils.asGridCoord(4,0)] : true,
    [utils.asGridCoord(5,0)] : true,
    [utils.asGridCoord(7,0)] : true,
    [utils.asGridCoord(8,0)] : true,
    [utils.asGridCoord(9,0)] : true,
    [utils.asGridCoord(10,0)] : true,
    [utils.asGridCoord(11,0)] : true,//
    [utils.asGridCoord(1,8)] : true,
    [utils.asGridCoord(2,8)] : true,
    [utils.asGridCoord(3,8)] : true,
    [utils.asGridCoord(4,8)] : true,
    [utils.asGridCoord(5,8)] : true,
    [utils.asGridCoord(7,8)] : true,
    [utils.asGridCoord(8,8)] : true,
    [utils.asGridCoord(9,8)] : true,
    [utils.asGridCoord(10,8)] : true,
    [utils.asGridCoord(11,8)] : true,
    [utils.asGridCoord(6,9)] : true,
  },
  cutsceneSpaces: {
    [utils.asGridCoord(6,0)]: [
      {
        events: [
        { type: "changeMap",
          map: "Tram",
          x: utils.withGrid(1),
          y: utils.withGrid(6),
          direction: "up",
         }
        ]
      }
    ],
    [utils.asGridCoord(6,8)]: [
      {
        events: [
        { type: "changeMap",
          map: "DemoRoom",
          x: utils.withGrid(6),
          y: utils.withGrid(12),
          direction: "up",
         }
        ]
      }
    ],
    [utils.asGridCoord(12,4)]: [
      {
        events: [
        { type: "changeLink", link: "3DLocation/3DIndex.html"}
        ]
      }
    ],
    [utils.asGridCoord(0,4)]: [
      {
        events: [
        { type: "changeLink", link: "SoundLocation/SoundIndex.html"}
        ]
      }
    ],
    }
  },
}