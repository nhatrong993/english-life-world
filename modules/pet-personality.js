(function () {
  "use strict";

  var MOOD_META = {
    love: {
      funDelta: 15,
      bondDelta: 6,
      rewardMultiplier: 1.5,
      emotionState: "excited",
      icon: "💖",
      badgeBg: "#ffe4ec",
      badgeStroke: "#ff4d88",
      textColor: "#7a1238"
    },
    like: {
      funDelta: 8,
      bondDelta: 3,
      rewardMultiplier: 1.25,
      emotionState: "playful",
      icon: "✨",
      badgeBg: "#fff6d6",
      badgeStroke: "#f59f00",
      textColor: "#5c3c00"
    },
    neutral: {
      funDelta: 1,
      bondDelta: 1,
      rewardMultiplier: 1.0,
      emotionState: "curious",
      icon: "🐾",
      badgeBg: "#f1f5f9",
      badgeStroke: "#94a3b8",
      textColor: "#334155"
    },
    dislike: {
      funDelta: -6,
      bondDelta: -1,
      rewardMultiplier: 1.0,
      emotionState: "sad_lonely",
      icon: "💦",
      badgeBg: "#e0f2fe",
      badgeStroke: "#0284c7",
      textColor: "#0c4a6e"
    }
  };

  var PROFILES = {
    milu: {
      id: "milu",
      name: "Milu",
      species: "dog",
      loves: {
        actions: [
          "throw_the_ball", "play_fetch", "catch_ball", "walk_the_dog",
          "run_in_park", "play_with_dog", "play_with_cat", "chase_butterflies",
          "jump_over_log", "dig_for_treasure", "fetch"
        ],
        rooms: ["park", "garden", "outdoor", "playground", "yard", "beach"],
        items: ["ball", "tennis_ball", "frisbee", "bone", "golden_bone", "leash", "stick", "fetch"],
        weather: ["sunny", "clear", "breezy"]
      },
      likes: {
        actions: [
          "pet_cat", "brush_cat", "feed_cat", "give_cat_water", "eat_breakfast",
          "order_steak", "grill_the_fish", "check_meat_price", "pick_chicken_breast",
          "flip_the_burger", "go_for_a_walk"
        ],
        rooms: ["living_room", "market_meat", "cafe_counter", "bakery", "kitchen", "campsite"],
        items: ["meat", "beef", "steak", "chicken", "sausage", "treat", "biscuit", "burger", "bacon"],
        weather: ["cloudy", "warm"]
      },
      dislikes: {
        actions: ["stay_alone", "lock_door", "scold", "vacuum_the_floor"],
        rooms: ["dark_cellar", "closet"],
        items: ["thunder", "lightning", "vacuum", "lonely", "cage", "fireworks"],
        weather: ["storm", "stormy", "thunder", "rainy"]
      },
      lines: {
        love: {
          en: "Woof! Throw the ball! I love playing at the park!",
          vi: "Gâu! Ném bóng đi! Mình mê chơi ở công viên lắm!"
        },
        like: {
          en: "Arf! That smells tasty! Can I have a treat too?",
          vi: "Gâu gâu! Thơm quá! Cho mình xin miếng thưởng với!"
        },
        dislike: {
          en: "Whine... I don't like storms or being lonely.",
          vi: "Ư ử... Mình sợ sấm chớp và cô đơn lắm."
        },
        neutral: {
          en: "Woof? Where are we going next, buddy?",
          vi: "Gâu? Chúng mình đi đâu tiếp đây bạn ơi?"
        },
        contextual: {
          ball: {
            en: "Woof! Throw the ball! I can catch it every time!",
            vi: "Gâu! Ném bóng đi! Mình bắt trúng mọi quả luôn!"
          },
          park: {
            en: "Yay, the park! Let's run and play fetch together!",
            vi: "Hoan hô, công viên! Cùng chạy và chơi bắt bóng nào!"
          },
          meat: {
            en: "Woof woof! Juicy meat and bones are my favorite!",
            vi: "Gâu gâu! Thịt ngọt và xương là món khoái khẩu của mình!"
          },
          storm: {
            en: "Awoo... Thunder is too loud! Stay close to me!",
            vi: "Hu hu... Sấm to quá! Ở cạnh mình nha!"
          }
        }
      }
    },

    boba: {
      id: "boba",
      name: "Boba",
      species: "dog",
      loves: {
        actions: [
          "throw_the_ball", "play_fetch", "catch_ball", "walk_the_dog",
          "run_in_park", "play_with_dog", "play_with_cat", "order_boba",
          "buy_cupcake", "eat_snack"
        ],
        rooms: ["park", "cafe_counter", "cafe_indoor", "bakery", "garden", "outdoor"],
        items: ["ball", "frisbee", "boba", "milk_tea", "treat", "cookie", "biscuit", "bone", "pudding"],
        weather: ["sunny", "clear", "warm"]
      },
      likes: {
        actions: ["pet_cat", "brush_cat", "feed_cat", "lie_on_sofa", "check_meat_price", "pick_chicken_breast"],
        rooms: ["living_room", "market_meat", "market_bakery", "bedroom"],
        items: ["meat", "beef", "steak", "chicken", "bread", "muffin", "sofa", "pillow"],
        weather: ["cloudy", "breezy"]
      },
      dislikes: {
        actions: ["stay_alone", "skip_meal", "vacuum_the_floor"],
        rooms: ["dark_cellar"],
        items: ["thunder", "storm", "lonely", "cage", "bitter_medicine"],
        weather: ["storm", "stormy", "thunder", "rainy"]
      },
      lines: {
        love: {
          en: "Yap yap! Bouncy balls and sweet café treats make me so happy!",
          vi: "Gâu gâu! Bóng nảy và bánh thơm ở quán làm mình vui mê tơi!"
        },
        like: {
          en: "Woof! This cozy spot and yummy smell are great!",
          vi: "Gâu! Chỗ ấm áp và mùi thơm này tuyệt ghê!"
        },
        dislike: {
          en: "Whimper... Rainy storms and loud noises scare me!",
          vi: "Ư ử... Mưa bão và tiếng ồn làm mình sợ lắm!"
        },
        neutral: {
          en: "Arf! I'm wiggling my tail and ready to explore!",
          vi: "Gâu! Mình đang vẫy đuôi sẵn sàng khám phá đây!"
        }
      }
    },

    cookie: {
      id: "cookie",
      name: "Cookie",
      species: "dog",
      loves: {
        actions: [
          "throw_the_ball", "play_fetch", "catch_ball", "walk_the_dog",
          "run_in_park", "play_with_dog", "play_with_cat", "bake_cookies",
          "smell_fresh_bread"
        ],
        rooms: ["park", "bakery", "market_bakery", "garden", "outdoor", "kitchen"],
        items: ["ball", "frisbee", "bone", "cookie", "biscuit", "treat", "meat", "steak"],
        weather: ["sunny", "clear", "warm"]
      },
      likes: {
        actions: ["pet_cat", "brush_cat", "feed_cat", "check_meat_price", "pick_chicken_breast"],
        rooms: ["living_room", "market_meat", "cafe_counter", "yard"],
        items: ["beef", "chicken", "sausage", "cheese", "butter", "toast"],
        weather: ["breezy", "cloudy"]
      },
      dislikes: {
        actions: ["stay_alone", "burn_toast", "vacuum_the_floor"],
        rooms: ["dark_cellar"],
        items: ["thunder", "storm", "lonely", "cage", "smoke"],
        weather: ["storm", "stormy", "thunder", "rainy"]
      },
      lines: {
        love: {
          en: "Woof! Playing fetch in the park and crunchy treats are the best!",
          vi: "Gâu! Chơi bắt bóng ở công viên và bánh quy giòn là nhất!"
        },
        like: {
          en: "Arf arf! Something smells delicious right here!",
          vi: "Gâu gâu! Có món gì thơm ngon quá chừng!"
        },
        dislike: {
          en: "Whine... No thunder please, let's stay safe inside!",
          vi: "Ư ử... Đừng có sấm chớp nha, mình ở trong nhà thôi!"
        },
        neutral: {
          en: "Woof! Cookie is right beside you!",
          vi: "Gâu! Cookie luôn đi sát bên bạn nè!"
        }
      }
    },

    mochi: {
      id: "mochi",
      name: "Mochi",
      species: "cat",
      loves: {
        actions: [
          "order_fresh_salmon", "buy_some_fish", "grill_the_fish", "feed_cat",
          "buy_fresh_milk", "pour_milk", "pet_cat", "brush_cat", "lie_on_sofa",
          "nap_in_sunbeam", "chase_laser"
        ],
        rooms: ["market_meat", "market_dairy", "living_room", "bedroom"],
        items: [
          "fish", "salmon", "tuna", "seafood", "shrimp", "sashimi",
          "milk", "cream", "catnip", "yarn", "sofa", "sunbeam"
        ],
        weather: ["sunny", "warm", "clear"]
      },
      likes: {
        actions: [
          "check_meat_price", "pick_chicken_breast", "take_milk",
          "give_cat_water", "drink_water", "sit_by_window", "play_with_cat",
          "read_on_sofa", "turn_on_heater"
        ],
        rooms: ["kitchen", "cafe_indoor", "bakery", "study"],
        items: [
          "meat", "chicken", "chicken_breast", "cheese", "butter", "yogurt",
          "cushion", "pillow", "blanket", "fireplace", "box", "feather"
        ],
        weather: ["cloudy", "breezy"]
      },
      dislikes: {
        actions: [
          "take_a_shower", "wash_hair", "water_plant", "splash_water",
          "give_bath", "swim_in_pool", "walk_in_rain"
        ],
        rooms: ["bathroom", "pool", "car_wash"],
        items: [
          "water", "bath", "shower", "rain", "wet", "swim", "wash",
          "soap", "shampoo", "hose", "puddle", "sprinkler", "storm", "cucumber"
        ],
        weather: ["rain", "rainy", "storm", "stormy", "snowy", "wet"]
      },
      lines: {
        love: {
          en: "Fresh fish! Purr, I love salmon and creamy milk!",
          vi: "Cá tươi kìa! Grừ grừ, mình mê cá hồi và sữa thơm lắm!"
        },
        like: {
          en: "Purr~ This is so warm, cozy, and tasty!",
          vi: "Grừ~ Ấm áp, êm ái và ngon miệng quá đi!"
        },
        dislike: {
          en: "Meow! No water please, I hate getting my paws wet!",
          vi: "Meo! Đừng dội nước mà, mình ghét bị ướt lông lắm!"
        },
        neutral: {
          en: "Meow~ I'm curiously watching what you do.",
          vi: "Meo~ Mình đang tò mò xem bạn làm gì đó."
        },
        contextual: {
          fish: {
            en: "Fresh fish! Purr, I love salmon at the seafood counter!",
            vi: "Cá tươi kìa! Grừ, mình mê cá hồi ở quầy hải sản lắm!"
          },
          milk: {
            en: "Meow~ Fresh milk and dairy treats make me purr!",
            vi: "Meo~ Sữa tươi mát lành làm mình kêu grừ grừ thích thú!"
          },
          warm: {
            en: "Purr... A warm sofa in the sunshine is pure heaven!",
            vi: "Grừ... Nằm sofa ấm dưới nắng đúng là thiên đường!"
          },
          water: {
            en: "Hiss! Meow! Keep that water and bath away from my fur!",
            vi: "Khè! Meo! Tránh xa nước tắm ra khỏi bộ lông của mình nha!"
          }
        }
      }
    },

    pepper: {
      id: "pepper",
      name: "Pepper",
      species: "cat",
      loves: {
        actions: [
          "order_fresh_salmon", "buy_some_fish", "grill_the_fish", "feed_cat",
          "check_meat_price", "pick_chicken_breast", "chase_laser", "pounce_toy"
        ],
        rooms: ["market_meat", "market_dairy", "kitchen", "rooftop"],
        items: [
          "fish", "salmon", "tuna", "seafood", "shrimp", "meat",
          "chicken", "milk", "cream", "mouse_toy", "feather"
        ],
        weather: ["sunny", "warm", "clear"]
      },
      likes: {
        actions: [
          "buy_fresh_milk", "take_milk", "pour_milk", "pet_cat", "brush_cat",
          "lie_on_sofa", "give_cat_water", "drink_water", "play_with_cat"
        ],
        rooms: ["living_room", "bedroom", "study", "cafe_indoor"],
        items: ["cheese", "sofa", "fireplace", "box", "yarn", "window"],
        weather: ["breezy", "cloudy"]
      },
      dislikes: {
        actions: [
          "take_a_shower", "wash_hair", "water_plant", "splash_water",
          "give_bath", "swim_in_pool"
        ],
        rooms: ["bathroom", "pool"],
        items: [
          "water", "bath", "shower", "rain", "wet", "swim", "wash",
          "soap", "hose", "storm"
        ],
        weather: ["rain", "rainy", "storm", "stormy", "wet"]
      },
      lines: {
        love: {
          en: "Meow! Fresh salmon and savory meat! My whiskers are tingling!",
          vi: "Meo! Cá hồi tươi và thịt thơm! Ria mép mình rung lên vì thích!"
        },
        like: {
          en: "Purr! A warm spot and a gentle pat feel nice.",
          vi: "Grừ! Chỗ nằm ấm áp và cái vuốt ve thật dễ chịu."
        },
        dislike: {
          en: "Mrow! No baths or water splashes for Pepper!",
          vi: "Meo! Không tắm hay té nước vào Pepper đâu nhé!"
        },
        neutral: {
          en: "Meow? My ears are perked up for adventure.",
          vi: "Meo? Đôi tai mình đang vểnh lên nghe ngóng đây."
        }
      }
    },

    oreo: {
      id: "oreo",
      name: "Oreo",
      species: "cat",
      loves: {
        actions: [
          "order_fresh_salmon", "buy_some_fish", "buy_fresh_milk", "take_milk",
          "pour_milk", "feed_cat", "lie_on_sofa", "pet_cat", "brush_cat"
        ],
        rooms: ["market_dairy", "market_meat", "living_room", "bedroom", "cafe_indoor"],
        items: [
          "milk", "cream", "cheese", "fish", "salmon", "tuna",
          "seafood", "shrimp", "sofa", "cushion", "blanket"
        ],
        weather: ["sunny", "warm", "clear"]
      },
      likes: {
        actions: [
          "check_meat_price", "pick_chicken_breast", "grill_the_fish",
          "give_cat_water", "drink_water", "play_with_cat"
        ],
        rooms: ["kitchen", "bakery", "study"],
        items: ["meat", "chicken", "cookie", "yarn", "fireplace", "pillow"],
        weather: ["cloudy", "breezy"]
      },
      dislikes: {
        actions: [
          "take_a_shower", "wash_hair", "water_plant", "splash_water",
          "give_bath", "swim_in_pool"
        ],
        rooms: ["bathroom", "pool"],
        items: [
          "water", "bath", "shower", "rain", "wet", "swim", "wash",
          "soap", "storm", "puddle"
        ],
        weather: ["rain", "rainy", "storm", "stormy", "wet"]
      },
      lines: {
        love: {
          en: "Purr~ Creamy milk, fresh fish, and a cozy sofa! Best day ever!",
          vi: "Grừ~ Sữa béo ngậy, cá tươi và ghế sofa êm! Ngày tuyệt nhất luôn!"
        },
        like: {
          en: "Meow! That looks tasty and relaxing!",
          vi: "Meo! Trông vừa ngon lành vừa thư giãn quá!"
        },
        dislike: {
          en: "Meow! Don't get my black-and-white coat wet with water!",
          vi: "Meo! Đừng làm ướt bộ lông trắng đen của mình bằng nước nha!"
        },
        neutral: {
          en: "Purr? What are we checking out over here?",
          vi: "Grừ? Chúng mình đang xem gì ở đây thế?"
        }
      }
    },

    ember: {
      id: "ember",
      name: "Ember",
      species: "dragon",
      loves: {
        actions: [
          "grill_the_fish", "flip_the_burger", "roast_marshmallow", "light_campfire",
          "bake_bread", "cook_dinner", "turn_on_heater", "bask_in_sun"
        ],
        rooms: ["kitchen", "restaurant", "outdoor", "campsite", "bakery", "fireplace_room"],
        items: [
          "grill", "bbq", "roast", "steak", "bake", "cook", "fire",
          "fireplace", "campfire", "oven", "stove", "flame", "charcoal", "hot", "warm"
        ],
        weather: ["sunny", "hot", "warm", "clear"]
      },
      likes: {
        actions: [
          "order_fresh_salmon", "check_meat_price", "pick_chicken_breast",
          "eat_spicy_noodles", "drink_hot_cocoa"
        ],
        rooms: ["market_meat", "cafe_counter", "park", "living_room"],
        items: ["meat", "beef", "chicken", "spicy", "pepper", "chili", "tea", "coffee", "gold", "gem"],
        weather: ["breezy"]
      },
      dislikes: {
        actions: ["open_fridge", "open_freezer", "eat_ice_cream", "walk_in_snow", "take_cold_shower"],
        rooms: ["market_frozen", "freezer", "ice_rink"],
        items: ["cold", "snow", "ice", "freezer", "fridge", "frost", "blizzard", "icicle", "ice_cream"],
        weather: ["cold", "snow", "snowy", "rainy", "rain", "storm", "freezing"]
      },
      lines: {
        love: {
          en: "Roar-puff! Sizzling BBQ grills and warm sunshine fuel my flame!",
          vi: "Gừ-phù! Bếp nướng xèo xèo và nắng ấm làm ngọn lửa của mình bừng sáng!"
        },
        like: {
          en: "Crackling sparks! That warm food smells awesome!",
          vi: "Tia lửa lách tách! Món ăn nóng hổi này thơm tuyệt!"
        },
        dislike: {
          en: "Brrr! Too cold and icy! My tail flame hates the freezer!",
          vi: "Brrr! Lạnh và băng giá quá! Lửa ở đuôi mình ghét tủ đông lắm!"
        },
        neutral: {
          en: "Puff~ My little wings are warm and ready!",
          vi: "Phù~ Đôi cánh nhỏ ấm áp của mình sẵn sàng rồi!"
        }
      }
    },

    lumi: {
      id: "lumi",
      name: "Lumi",
      species: "unicorn",
      loves: {
        actions: [
          "pick_fresh_fruit", "buy_apples", "eat_strawberry_cake", "smell_flowers",
          "water_plant", "walk_in_park", "stargaze", "order_sweet_dessert"
        ],
        rooms: ["market_produce", "park", "garden", "cafe_indoor", "bakery", "flower_shop"],
        items: [
          "fruit", "apple", "berry", "strawberry", "peach", "cherry",
          "sweet", "cake", "cupcake", "dessert", "flower", "rose",
          "star", "rainbow", "crystal", "honey"
        ],
        weather: ["sunny", "clear", "rainbow", "starry"]
      },
      likes: {
        actions: ["buy_fresh_milk", "pour_milk", "brush_cat", "pet_cat", "read_book"],
        rooms: ["living_room", "bedroom", "market_dairy", "study"],
        items: ["milk", "tea", "yogurt", "juice", "book", "music", "ribbon", "cloud"],
        weather: ["breezy", "warm"]
      },
      dislikes: {
        actions: ["take_out_trash", "step_in_mud", "dig_in_dirt"],
        rooms: ["alley", "dumpster", "dark_cellar"],
        items: ["mud", "trash", "garbage", "dirt", "dust", "slime", "smoke", "dark"],
        weather: ["storm", "stormy", "dark", "smog"]
      },
      lines: {
        love: {
          en: "Sparkle neigh! Sweet berries, flowers, and sunny parks are magical!",
          vi: "Lấp lánh hí! Quả ngọt, hoa tươi và công viên nắng ấm thật diệu kỳ!"
        },
        like: {
          en: "Twinkle~ Such a gentle and lovely vibe right here!",
          vi: "Lung linh~ Không khí ở đây thật dịu dàng và đáng yêu!"
        },
        dislike: {
          en: "Oh no... Mud, trash, and dark storms dull my horn's glow!",
          vi: "Ôi không... Bùn đất, rác và bão tối làm mờ ánh sừng của mình!"
        },
        neutral: {
          en: "Shimmer~ Where shall our starlight guide us next?",
          vi: "Lấp lánh~ Ánh sao sẽ dẫn chúng mình đi đâu tiếp đây?"
        }
      }
    },

    pip: {
      id: "pip",
      name: "Pip",
      species: "arctic_fox",
      loves: {
        actions: [
          "open_fridge", "open_freezer", "buy_ice_cream", "play_in_snow",
          "check_frozen_food", "drink_cold_milk", "skate_on_ice"
        ],
        rooms: ["market_frozen", "market_dairy", "ice_rink", "snow_field", "fridge"],
        items: [
          "cold", "snow", "ice", "ice_cream", "popsicle", "winter",
          "fridge", "freezer", "frozen", "snowflake", "milk", "yogurt"
        ],
        weather: ["cold", "snow", "snowy", "winter", "freezing", "frosty"]
      },
      likes: {
        actions: ["order_fresh_salmon", "buy_some_fish", "throw_the_ball", "play_fetch", "run_in_park"],
        rooms: ["market_meat", "park", "living_room", "bedroom"],
        items: ["fish", "salmon", "shrimp", "ball", "fluffy_pillow", "berry"],
        weather: ["cloudy", "breezy", "clear"]
      },
      dislikes: {
        actions: ["grill_the_fish", "light_campfire", "turn_on_heater", "bake_in_oven"],
        rooms: ["sauna", "boiler_room"],
        items: ["hot", "heat", "fire", "grill", "oven", "campfire", "fireplace", "bbq", "stove", "flame"],
        weather: ["hot", "heatwave", "scorching"]
      },
      lines: {
        love: {
          en: "Yip yip! Cool snow, icy treats, and the frozen aisle feel like home!",
          vi: "Chíp chíp! Tuyết mát, kem lạnh và quầy đồ đông lạnh cứ như ở nhà vậy!"
        },
        like: {
          en: "Yip! Fresh salmon and a playful bounce make me happy!",
          vi: "Chíp! Cá hồi tươi và trò nhảy nhót làm mình vui ghê!"
        },
        dislike: {
          en: "Pant pant... Too hot! Keep me away from fire and blazing grills!",
          vi: "Phù phù... Nóng quá! Cho mình tránh xa lửa và bếp nướng nha!"
        },
        neutral: {
          en: "Yip~ My fluffy white tail is swishing curiously!",
          vi: "Chíp~ Chiếc đuôi trắng xù của mình đang ngoắt tò mò nè!"
        }
      }
    },

    aqua: {
      id: "aqua",
      name: "Aqua",
      species: "sea_otter",
      loves: {
        actions: [
          "take_a_shower", "wash_hair", "water_plant", "splash_water",
          "swim_in_pool", "order_fresh_salmon", "buy_some_fish", "drink_water",
          "give_cat_water", "play_in_fountain", "watch_ducks"
        ],
        rooms: [
          "bathroom", "pond", "duckpond", "fountain", "lakedock",
          "beach", "pool", "market_meat", "river"
        ],
        items: [
          "water", "bath", "shower", "swim", "rain", "pond", "duckpond",
          "fountain", "lakedock", "fish", "salmon", "shrimp", "seafood",
          "tuna", "clam", "shell", "crab", "bubble", "puddle"
        ],
        weather: ["rain", "rainy", "wet", "drizzle", "breezy"]
      },
      likes: {
        actions: ["throw_the_ball", "play_fetch", "open_fridge", "buy_fresh_milk"],
        rooms: ["park", "garden", "market_dairy", "market_frozen", "kitchen"],
        items: ["ball", "ice", "milk", "seaweed", "pebble", "towel"],
        weather: ["sunny", "cloudy", "clear"]
      },
      dislikes: {
        actions: ["sweep_the_floor", "walk_in_desert", "use_hair_dryer"],
        rooms: ["desert", "attic", "boiler_room"],
        items: ["dry", "hot", "dust", "sweep", "sandstorm", "smoke", "trash", "drought"],
        weather: ["hot", "dry", "dusty", "scorching"]
      },
      lines: {
        love: {
          en: "Splash squeak! Cool water, bath time, and fresh salmon are the best!",
          vi: "Tõm chít! Nước mát, giờ tắm và cá hồi tươi là tuyệt vời nhất!"
        },
        like: {
          en: "Chirp! Let's float around and play together!",
          vi: "Chít chít! Cùng nổi bồng bềnh và chơi đùa nào!"
        },
        dislike: {
          en: "Squeak... Too dry, hot, and dusty! I need some water!",
          vi: "Chít... Khô nóng và bụi bặm quá! Mình cần nước mát cơ!"
        },
        neutral: {
          en: "Squeak~ Holding my favorite pebble and following you!",
          vi: "Chít~ Mình đang ôm viên sỏi yêu thích và đi theo bạn nè!"
        }
      }
    }
  };

  var DRINK_SAFE_ACTIONS = {
    give_cat_water: true,
    drink_water: true,
    drink_some_water: true,
    pour_water: true,
    buy_water_bottle: true
  };

  var _lastAutoHookSig = "";
  var _lastAutoHookAt = 0;
  var _bubbleTimer = null;

  function norm(val) {
    return String(val == null ? "" : val)
      .trim()
      .toLowerCase()
      .replace(/[\s\-]+/g, "_");
  }

  function tokenize(str) {
    var clean = norm(str);
    if (!clean) return [];
    var parts = clean.split(/[^a-z0-9]+/).filter(Boolean);
    if (parts.indexOf(clean) === -1) {
      parts.unshift(clean);
    }
    return parts;
  }

  function getActivePetIdFallback() {
    try {
      if (window.ELW_PET_NEEDS && typeof window.ELW_PET_NEEDS.getActivePetId === "function") {
        var id = norm(window.ELW_PET_NEEDS.getActivePetId());
        if (id && PROFILES[id]) return id;
      }
    } catch (_e) {}
    return "milu";
  }

  function resolvePetId(petId) {
    var clean = norm(petId);
    if (clean && PROFILES[clean]) return clean;
    return getActivePetIdFallback();
  }

  function getProfile(petId) {
    var id = resolvePetId(petId);
    return PROFILES[id] || PROFILES.milu;
  }

  function getAllProfiles() {
    return Object.assign({}, PROFILES);
  }

  function normalizeContext(rawContext, fallbackWorldState, fallbackActionObj) {
    if (typeof rawContext === "string") {
      return {
        actionId: norm(rawContext),
        room: norm(fallbackWorldState && (fallbackWorldState.room || fallbackWorldState.scene || fallbackWorldState.location)),
        item: norm(rawContext),
        weather: norm(fallbackWorldState && fallbackWorldState.weather)
      };
    }
    var ctx = rawContext && typeof rawContext === "object" ? rawContext : {};
    var ws = fallbackWorldState && typeof fallbackWorldState === "object" ? fallbackWorldState : {};
    var actObj = fallbackActionObj && typeof fallbackActionObj === "object" ? fallbackActionObj : {};

    var actionId = norm(
      ctx.actionId || ctx.action || ctx.id || ctx.verb ||
      actObj.id || actObj.actionId || actObj.key || ""
    );
    var room = norm(
      ctx.room || ctx.roomId || ctx.scene || ctx.sceneId || ctx.location || ctx.zone ||
      ws.room || ws.roomId || ws.scene || ws.sceneId || ws.location ||
      (window.ELW_PET_ADVENTURE && typeof window.ELW_PET_ADVENTURE.getCurrentScene === "function"
        ? window.ELW_PET_ADVENTURE.getCurrentScene()
        : "")
    );
    var item = norm(
      ctx.item || ctx.itemId || ctx.target || ctx.food || ctx.object || ctx.prop ||
      actObj.item || actObj.target || actObj.en || ""
    );
    var weather = norm(
      ctx.weather || ctx.weatherId || ctx.climate ||
      ws.weather || ws.weatherId || ""
    );

    return {
      actionId: actionId,
      room: room,
      item: item,
      weather: weather
    };
  }

  function matchesBucket(bucket, context, profile, isDislikeBucket) {
    if (!bucket) return { matched: false, score: 0, matchedTokens: [] };

    var actionId = context.actionId;
    var room = context.room;
    var item = context.item;
    var weather = context.weather;

    var actionTokens = tokenize(actionId);
    var itemTokens = tokenize(item);
    var roomTokens = tokenize(room);
    var weatherTokens = tokenize(weather);

    var isCatDrinkingWater =
      isDislikeBucket &&
      profile &&
      profile.species === "cat" &&
      (DRINK_SAFE_ACTIONS[actionId] || DRINK_SAFE_ACTIONS[item]) &&
      item !== "water" &&
      actionId !== "water";

    var matchedTokens = [];
    var score = 0;

    function checkList(list, candidateExact, candidateTokens, weightExact, weightToken, skipWaterToken) {
      if (!Array.isArray(list) || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        var entry = norm(list[i]);
        if (!entry) continue;
        if (skipWaterToken && (entry === "water" || entry === "wet")) continue;

        if (candidateExact && candidateExact === entry) {
          score += weightExact;
          if (matchedTokens.indexOf(entry) === -1) matchedTokens.push(entry);
          continue;
        }
        if (candidateExact && entry.indexOf("_") !== -1 && candidateExact.indexOf(entry) !== -1) {
          score += weightExact;
          if (matchedTokens.indexOf(entry) === -1) matchedTokens.push(entry);
          continue;
        }
        for (var j = 0; j < candidateTokens.length; j++) {
          var tok = candidateTokens[j];
          if (skipWaterToken && (tok === "water" || tok === "wet")) continue;
          if (tok === entry) {
            score += weightToken;
            if (matchedTokens.indexOf(entry) === -1) matchedTokens.push(entry);
            break;
          }
        }
      }
    }

    // Check actions against both actionId and item
    checkList(bucket.actions, actionId, actionTokens, 3, 2, isCatDrinkingWater);
    checkList(bucket.actions, item, itemTokens, 2, 1, isCatDrinkingWater);

    // Check items against both item and actionId tokens (e.g. order_fresh_salmon -> salmon)
    checkList(bucket.items, item, itemTokens, 3, 2, isCatDrinkingWater);
    checkList(bucket.items, actionId, actionTokens, 2, 2, isCatDrinkingWater);

    // Check rooms against room (and if room passed via item/actionId)
    checkList(bucket.rooms, room, roomTokens, 2, 1, false);
    checkList(bucket.rooms, actionId, actionTokens, 1, 1, false);

    // Check weather against weather (and actionId/item tokens like walk_in_rain / snow)
    checkList(bucket.weather, weather, weatherTokens, 3, 2, false);
    checkList(bucket.weather, item, itemTokens, 2, 1, isCatDrinkingWater);
    checkList(bucket.weather, actionId, actionTokens, 2, 1, isCatDrinkingWater);

    return {
      matched: score > 0,
      score: score,
      matchedTokens: matchedTokens
    };
  }

  function pickContextualLines(profile, mood, context, matchedTokens) {
    var lines = (profile && profile.lines) || {};
    var contextual = lines.contextual || {};
    var allTokens = []
      .concat(matchedTokens || [])
      .concat(tokenize(context.item))
      .concat(tokenize(context.actionId))
      .concat(tokenize(context.room))
      .concat(tokenize(context.weather));

    if (mood === "love" || mood === "like") {
      if (
        allTokens.indexOf("fish") !== -1 ||
        allTokens.indexOf("salmon") !== -1 ||
        allTokens.indexOf("tuna") !== -1 ||
        allTokens.indexOf("seafood") !== -1 ||
        allTokens.indexOf("shrimp") !== -1
      ) {
        if (contextual.fish) return contextual.fish;
        if (profile.species === "cat") {
          return {
            en: "Fresh fish! Purr, I love salmon and seafood!",
            vi: "Cá tươi kìa! Grừ grừ, mình mê cá hồi và hải sản lắm!"
          };
        }
      }
      if (
        allTokens.indexOf("milk") !== -1 ||
        allTokens.indexOf("cream") !== -1 ||
        allTokens.indexOf("cheese") !== -1 ||
        context.room === "market_dairy"
      ) {
        if (contextual.milk) return contextual.milk;
      }
      if (
        allTokens.indexOf("ball") !== -1 ||
        allTokens.indexOf("fetch") !== -1 ||
        allTokens.indexOf("frisbee") !== -1
      ) {
        if (contextual.ball) return contextual.ball;
        if (profile.species === "dog") {
          return {
            en: "Woof! Throw the ball! I love playing fetch!",
            vi: "Gâu! Ném bóng đi! Mình thích chơi bắt bóng lắm!"
          };
        }
      }
      if (allTokens.indexOf("park") !== -1 && contextual.park) {
        return contextual.park;
      }
      if (
        (allTokens.indexOf("meat") !== -1 ||
          allTokens.indexOf("steak") !== -1 ||
          allTokens.indexOf("bone") !== -1) &&
        contextual.meat
      ) {
        return contextual.meat;
      }
      if (
        (allTokens.indexOf("sofa") !== -1 ||
          allTokens.indexOf("warm") !== -1 ||
          allTokens.indexOf("sunny") !== -1) &&
        contextual.warm
      ) {
        return contextual.warm;
      }
    }

    if (mood === "dislike") {
      if (
        (allTokens.indexOf("water") !== -1 ||
          allTokens.indexOf("bath") !== -1 ||
          allTokens.indexOf("shower") !== -1 ||
          allTokens.indexOf("rain") !== -1 ||
          allTokens.indexOf("rainy") !== -1) &&
        contextual.water
      ) {
        return contextual.water;
      }
      if (
        (allTokens.indexOf("storm") !== -1 || allTokens.indexOf("thunder") !== -1) &&
        contextual.storm
      ) {
        return contextual.storm;
      }
    }

    var fallback = lines[mood] || lines.neutral || {
      en: profile.name + " reacts with " + mood + "!",
      vi: profile.name + " đang phản ứng " + mood + "!"
    };
    return fallback;
  }

  function evaluateMood(profile, context) {
    var dislikeRes = matchesBucket(profile.dislikes, context, profile, true);
    var loveRes = matchesBucket(profile.loves, context, profile, false);
    var likeRes = matchesBucket(profile.likes, context, profile, false);

    // Check explicit item/action/weather dislikes first (e.g. Mochi + water/bath/shower/rainy)
    var directDislikeContext = {
      actionId: context.actionId,
      item: context.item,
      weather: context.weather,
      room: (!context.actionId && !context.item) ? context.room : ""
    };
    var directDislike = matchesBucket(profile.dislikes, directDislikeContext, profile, true);
    if (directDislike.matched) {
      return { mood: "dislike", matchedTokens: directDislike.matchedTokens };
    }

    // Love match or strong combined room + like match
    if (loveRes.matched) {
      return { mood: "love", matchedTokens: loveRes.matchedTokens };
    }

    if (likeRes.matched && likeRes.score >= 4) {
      return { mood: "love", matchedTokens: likeRes.matchedTokens };
    }

    if (likeRes.matched) {
      return { mood: "like", matchedTokens: likeRes.matchedTokens };
    }

    if (dislikeRes.matched) {
      return { mood: "dislike", matchedTokens: dislikeRes.matchedTokens };
    }

    return { mood: "neutral", matchedTokens: [] };
  }

  var _lastReaction = null;
  var _subscribers = [];

  function notifyPersonalitySubscribers(reaction) {
    for (var i = 0; i < _subscribers.length; i++) {
      try {
        _subscribers[i](reaction);
      } catch (_e) {}
    }
  }

  function renderReactBubble(result, durationMs) {
    if (typeof document === "undefined" || !result) return false;
    try {
      var host =
        document.getElementById("catScale") ||
        document.getElementById("o-cat");
      if (!host) return false;

      var svgNS = "http://www.w3.org/2000/svg";
      var oldBubble = document.getElementById("petReactBubble");
      if (oldBubble && oldBubble.parentNode) {
        oldBubble.parentNode.removeChild(oldBubble);
      }
      if (_bubbleTimer) {
        clearTimeout(_bubbleTimer);
        _bubbleTimer = null;
      }

      var meta = MOOD_META[result.mood] || MOOD_META.neutral;
      var g = document.createElementNS(svgNS, "g");
      g.setAttribute("id", "petReactBubble");
      g.setAttribute("class", "pet-react-bubble pet-react-" + result.mood);
      g.setAttribute("transform", "translate(30, -28)");
      g.setAttribute("style", "pointer-events:none; transition: opacity 0.28s ease, transform 0.28s ease; opacity: 1;");

      var lineEn = String(result.lineEn || "");
      var lineVi = String(result.lineVi || "");
      var maxChars = Math.max(lineEn.length, lineVi.length, 16);
      var boxW = Math.min(250, Math.max(136, maxChars * 5.6 + 34));
      var boxH = lineVi ? 40 : 26;
      var boxX = -Math.round(boxW / 2);
      var boxY = -boxH;

      var rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", String(boxX));
      rect.setAttribute("y", String(boxY));
      rect.setAttribute("width", String(boxW));
      rect.setAttribute("height", String(boxH));
      rect.setAttribute("rx", "10");
      rect.setAttribute("ry", "10");
      rect.setAttribute("fill", meta.badgeBg);
      rect.setAttribute("stroke", meta.badgeStroke);
      rect.setAttribute("stroke-width", "1.8");
      g.appendChild(rect);

      var tail = document.createElementNS(svgNS, "path");
      tail.setAttribute("d", "M -6 " + boxY + " m 0 " + boxH + " l 6 7 l 6 -7 Z");
      tail.setAttribute("fill", meta.badgeBg);
      tail.setAttribute("stroke", meta.badgeStroke);
      tail.setAttribute("stroke-width", "1.5");
      g.appendChild(tail);

      var textEn = document.createElementNS(svgNS, "text");
      textEn.setAttribute("x", "0");
      textEn.setAttribute("y", String(boxY + 15));
      textEn.setAttribute("text-anchor", "middle");
      textEn.setAttribute("fill", meta.textColor);
      textEn.setAttribute("font-size", "9.5");
      textEn.setAttribute("font-weight", "700");
      textEn.setAttribute("font-family", "Nunito, sans-serif");
      textEn.textContent = meta.icon + " " + (lineEn.length > 42 ? lineEn.slice(0, 40) + "…" : lineEn);
      g.appendChild(textEn);

      if (lineVi) {
        var textVi = document.createElementNS(svgNS, "text");
        textVi.setAttribute("x", "0");
        textVi.setAttribute("y", String(boxY + 29));
        textVi.setAttribute("text-anchor", "middle");
        textVi.setAttribute("fill", meta.textColor);
        textVi.setAttribute("opacity", "0.85");
        textVi.setAttribute("font-size", "8.2");
        textVi.setAttribute("font-weight", "600");
        textVi.setAttribute("font-family", "Nunito, sans-serif");
        textVi.textContent = lineVi.length > 46 ? lineVi.slice(0, 44) + "…" : lineVi;
        g.appendChild(textVi);
      }

      host.appendChild(g);

      var ttl = Number(durationMs) > 0 ? Number(durationMs) : 3200;
      _bubbleTimer = setTimeout(function () {
        try {
          var current = document.getElementById("petReactBubble");
          if (current) {
            current.style.opacity = "0";
            setTimeout(function () {
              if (current && current.parentNode) {
                current.parentNode.removeChild(current);
              }
            }, 300);
          }
        } catch (_err) {}
      }, ttl);

      return true;
    } catch (_e) {
      return false;
    }
  }

  function buildObjectiveActionKey(context, matchedTokens) {
    var parts = [];
    if (context.room) parts.push(context.room);
    if (context.actionId) parts.push(context.actionId);
    if (context.item && context.item !== context.actionId) parts.push(context.item);
    if (context.weather) parts.push(context.weather);
    if (!parts.length && matchedTokens && matchedTokens.length) {
      parts.push(matchedTokens[0]);
    }
    return parts.join(":") || "general";
  }

  function applyReactionSideEffects(result, options) {
    var opts = options && typeof options === "object" ? options : {};
    _lastReaction = result;
    if (opts.apply === false) return result;

    var now = Date.now();
    var sig = [
      result.petId,
      result.mood,
      result.context.actionId,
      result.context.room,
      result.context.item,
      result.context.weather
    ].join("|");

    // Prevent duplicate automatic hook firing within 75ms for the exact same event
    if (opts.fromHook && sig === _lastAutoHookSig && now - _lastAutoHookAt < 75) {
      result.deduped = true;
      return result;
    }
    _lastAutoHookSig = sig;
    _lastAutoHookAt = now;

    if (result.mood !== "neutral") {
      try {
        if (window.ELW_PET_NEEDS && typeof window.ELW_PET_NEEDS.applyNeedDelta === "function") {
          window.ELW_PET_NEEDS.applyNeedDelta({
            fun: result.funDelta,
            bond: result.bondDelta
          });
        }
      } catch (_e1) {}

      try {
        if (window.ELW_PET_NEEDS && typeof window.ELW_PET_NEEDS.setTemporaryState === "function") {
          window.ELW_PET_NEEDS.setTemporaryState(result.emotionState, 3600);
        }
      } catch (_e2) {}

      if (result.rewardMultiplier > 1) {
        try {
          if (window.ELW_PET_REWARDS && typeof window.ELW_PET_REWARDS.claimObjectiveReward === "function") {
            var actionKey = buildObjectiveActionKey(result.context, result.matchedTokens);
            var objectiveId = "pet25d_react:" + result.petId + ":" + actionKey;
            result.reward = window.ELW_PET_REWARDS.claimObjectiveReward(objectiveId, {
              stars: result.mood === "love" ? 2 : 1,
              xp: result.mood === "love" ? 6 : 3,
              bond: 0,
              label: result.lineEn
            });
          }
        } catch (_e3) {}
      }

      if (opts.showBubble !== false) {
        renderReactBubble(result);
        try {
          if (window.ELW_PET_ANIM && typeof window.ELW_PET_ANIM.triggerEmotionAnim === "function") {
            window.ELW_PET_ANIM.triggerEmotionAnim(result.mood, 2400);
          }
        } catch (_e4) {}
      }
    }

    notifyPersonalitySubscribers(result);
    return result;
  }

  function react(petIdOrContext, maybeContext, maybeOptions) {
    var petId;
    var rawContext;
    var options;

    if (petIdOrContext && typeof petIdOrContext === "object") {
      petId = petIdOrContext.petId || getActivePetIdFallback();
      rawContext = petIdOrContext;
      options = maybeContext && typeof maybeContext === "object" ? maybeContext : {};
    } else {
      petId = resolvePetId(petIdOrContext);
      rawContext = maybeContext;
      options = maybeOptions && typeof maybeOptions === "object" ? maybeOptions : {};
    }

    var profile = getProfile(petId);
    var context = normalizeContext(rawContext);
    var evalRes = evaluateMood(profile, context);
    var mood = evalRes.mood;
    var meta = MOOD_META[mood] || MOOD_META.neutral;
    var chosenLine = pickContextualLines(profile, mood, context, evalRes.matchedTokens);

    var result = {
      petId: profile.id,
      petName: profile.name,
      species: profile.species,
      mood: mood,
      funDelta: meta.funDelta,
      bondDelta: meta.bondDelta,
      rewardMultiplier: meta.rewardMultiplier,
      emotionState: meta.emotionState,
      lineEn: chosenLine.en,
      lineVi: chosenLine.vi,
      text: chosenLine.en,
      icon: meta.icon,
      matchedTokens: evalRes.matchedTokens,
      matchedTags: evalRes.matchedTokens,
      context: context,
      reward: null
    };

    return applyReactionSideEffects(result, options);
  }

  function triggerWorldReaction(context, options) {
    var ctx = context && typeof context === "object" ? context : {};
    var pid = resolvePetId(ctx.petId || getActivePetIdFallback());
    var opts = Object.assign({ apply: true, showBubble: true }, options || {});
    return react(pid, ctx, opts);
  }

  function onWorldAction(actionId, worldState, actionObj) {
    var activePetId = getActivePetIdFallback();
    var ws = worldState && typeof worldState === "object" ? worldState : {};
    var act = actionObj && typeof actionObj === "object" ? actionObj : {};

    var context = normalizeContext(
      {
        actionId: actionId || ws.actionId || act.id || "",
        room: ws.room || ws.roomId || ws.scene || ws.location || act.room || "",
        item: ws.item || ws.target || act.item || act.target || act.en || "",
        weather: ws.weather || act.weather || ""
      },
      ws,
      act
    );

    return react(activePetId, context, { apply: true, showBubble: true, fromHook: true });
  }

  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    _subscribers.push(fn);
    return function () {
      var idx = _subscribers.indexOf(fn);
      if (idx !== -1) _subscribers.splice(idx, 1);
    };
  }

  function getLastReaction() {
    return _lastReaction;
  }

  function getActiveProfile() {
    return getProfile(getActivePetIdFallback());
  }

  function installAdventureHook() {
    if (typeof window === "undefined") return;
    var orig = window.ELW_PET_ADVENTURE;
    if (!orig || orig.__petPersonalityHooked) return;

    var origOnWorldAction = typeof orig.onWorldAction === "function" ? orig.onWorldAction.bind(orig) : null;
    var origOnAction = typeof orig.onAction === "function" ? orig.onAction.bind(orig) : null;

    var wrapped = Object.assign({}, orig, {
      __petPersonalityHooked: true,
      onWorldAction: function (actionId, worldState, actionObj) {
        var baseRes;
        if (origOnWorldAction) {
          try {
            baseRes = origOnWorldAction(actionId, worldState, actionObj);
          } catch (_e) {}
        }
        var reactRes = onWorldAction(actionId, worldState, actionObj);
        if (baseRes && typeof baseRes === "object") {
          return Object.assign({}, baseRes, { personalityReaction: reactRes });
        }
        return reactRes;
      },
      onAction: function (actionId, ctx, actionObj) {
        var baseRes;
        if (origOnAction) {
          try {
            baseRes = origOnAction(actionId, ctx, actionObj);
          } catch (_e) {}
        }
        var reactRes = onWorldAction(actionId, ctx, actionObj);
        if (baseRes && typeof baseRes === "object") {
          return Object.assign({}, baseRes, { personalityReaction: reactRes });
        }
        return reactRes;
      }
    });

    try {
      window.ELW_PET_ADVENTURE = wrapped;
    } catch (_err) {}
  }

  function init() {
    installAdventureHook();
    return api;
  }

  installAdventureHook();
  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installAdventureHook);
  }

  var api = {
    PROFILES: PROFILES,
    MOOD_META: MOOD_META,
    init: init,
    getProfile: getProfile,
    getActivePetId: getActivePetIdFallback,
    getActiveProfile: getActiveProfile,
    getAllProfiles: getAllProfiles,
    react: react,
    triggerWorldReaction: triggerWorldReaction,
    onWorldAction: onWorldAction,
    renderReactBubble: renderReactBubble,
    showReactionBubble: renderReactBubble,
    getLastReaction: getLastReaction,
    subscribe: subscribe,
    installAdventureHook: installAdventureHook
  };

  if (typeof window !== "undefined") {
    window.ELW_PET_PERSONALITY = api;
  }
})();
