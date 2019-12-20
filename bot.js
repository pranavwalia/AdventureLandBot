var fs = require("fs");

var data = "New File Contents";

fs.writeFile("temp.txt", data, (err) => {
  if (err) log(err);
  console.log("Successfully Written to File.");
});
/*
List of Locations

---------------Stores----
Upgrade Guy: -199, -184, Main
Potion Store: -50, -118, Main
Scroll Guy: -385, 6, Main
Bank: -1.14, -89, Bank

---------Mob Farms------
Slime Balls (Easy): -19, 891, Main
Crabs: 1224, -201, Main
Octopus: -1151, 332, Main

*/





/*
TODO
- SMARTER ATTACKING FEATURES
	- Depending on where it is and a variety of variables it will
	decide where to go to farm.
	- Depending on the monster, it will use different fighting strats
	- Automate buying and/or upgrading items.
	- Automate equipping items to optimize character.
	- Abstract item refills: One function to manage item refills and routine 		 purchaes
	- Auto-deposit Gold
*/

/*
These are various status variables that reflect
the state of the character.
- attacking are we in combat?
- buying are we on our way to buy something?
- LastPosx, last recorded position
- LastPoxy, last recorded position.
*/
var attack_mode=true;
var attacking = false;
var buying = false;
var lastPosx;
var lastPoxy;

/*---------------------Utility Functions----------------------------------*/
/*
moveWhenStill()
- Smart Move but automatically checks if character is still or not. 
*/

//Returns the maximum amount of an Item That You Could Purchase
function purchaseQuantity(item) {
	var amount = character.gold/G.items[item].g;
	if (amount < 1) {
		return 0;
	} else {
		return amount;
	}
	
}

/*Returns the quantity of the item in your inventory 
itemcount(item))*/
function itemCount(item) {
	var count = 0
	var i;
	for (i = 0; i < character.items.length; i++) {
		if (character.items[i] != null) {
			if (character.items[i].name == item) {
				count = character.items[i].q;
				break;
			}
		}
	}
	set_message(item + ": " + count);
	return count;
}



	


/*----------------------------------------------------------------------*/


/*----------------------Combat Functions---------------------------------*/
//(abstract this into a general use function);
//Uses a Mana Potion or Health Potion Once falls below percentage
//Arguments: percentage (floating point decimal <= 1)
function useManaOrHealthPotion(percentage) {
	if (character.hp < ((percentage) * (character.max_hp)) 
	   || character.mp < ((percentage) * (character.max_mp))) {
		use_hp_or_mp();
	}
}

/*
Saves Information About A newly Encountered Monster
*/



/*
Retreats from the enemies that have us heavily out-classed.
*/


/*
Target: NPC
Checks whether a target is easy to kill. 
(Can kill in five or less attacks)
Target: Target
*/
function isEasyOp(target) {
	return (target.max_hp <= (character.attack * 5));
}

/*
Checks whether a target is medium level Difficulty.
Requires more than 5 standard attacks to kill but less than 20.
*/
function isMedOp(target) {
	return ((target.max_hp >= (character.attack * 5)) &&
			(target.max_hp <= (character.attack * 20)));
}

/*
Checks whether a target is a hard level difficulty.
Requires more than 20 attacks to kill
*/
function isHardOp(target) {
	return (target.max_hp >= (character.attack * 20));
}

/*
Calculates the (gold cost) in terms of the cost of 1hp of taking a hit from a specific monster.
*/
function costFromHit(target) {
	var resistance = character.resistance;
	var dmgType = target.damage_type;
	var atk = target.attack;
	var dmgDealt = 0;
	var costOfHp = G.items.hpot0.g/200;
	
	if (dmgType == "physical") {
		dmgDealt = (atk - (character.armor * .1));
		return costOfHp * dmgDealt;
		
	} else {
		dmgDealt = (atk - (character.resistance * .1))
		return costOfHp * dmgDealt;
	}

}

/*
Calculates the cost per second of recieving hits from a target
*/
function cpsCombat(target) {
	return (costFromHit(target) * target.frequency);
	
}

/*
Calculates the cheapest cost to kill in terms of mana. 
cpsCombat * (time it takes to kill) + (spendperSecCombat * time it takes to kill))

*/


/*
Finds the most cost effective way to kill a target using the currently available abilities.

*/


/*
Strategy for fighting an easy opponent (Straight-Forward Attack)
and only use mana or health when it reaches really low levels.
*/
function fightEasy(target) {
	attacking = true;
	set_message("Attacking");
	useManaOrHealthPotion(.30);
	attack(target);
}

/*
strategy for fighting a medium opponent
*/
//function fightMed(target) {}
/*
strategy for fighting a hard opponent
*/
//function fightHard(target) {}

/*
determines the difficulty of the opponent and uses the optimal fighting strategy.
*/
function compAtk() {
	var target=get_targeted_monster();
	if(!target)
	{
		var minimumXP = 0;
		target=get_nearest_monster({min_xp:minimumXP,
									max_att:character.attack * 2});
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(!in_attack_range(target))
	{
		
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		attacking = true;
		set_message("Attacking");
		attack(target);
		if (target.hp < 7 * character.attack) {
			useManaOrHealthPotion(.20);
		} else {
			useManaOrHealthPotion(.60);
		}
		
		
		if (character.mp > (.8 * character.max_mp) && 
			target.hp > .8 * character.max_hp) {
			use_skill("burst",target);
			}
	}
}

/*----------------------------------------------------------------------*/

/*-----------------------------Character Logistics------------------------*/
/*Refills the Item Below A Certain Number. If you cannot afford the requested
amount. It will simply purchase the maximum. Moves the character to the buying
location and then returns him back to where he originally started.
Arguments - amount (int) : minimum amount to buy 
			  buyarg (int) : Quatntity to buy
			  item (String) : item name,
			  (x,y) shop location,.
			  */
function refillItem(amount,buyarg,item,x,y) {
	set_message("call refillItem");
	var ToBuy = purchaseQuantity(item);
	if (ToBuy == 0) {
		log("Cannot Afford " + buyarg + " " + item);
		return;
	//Buys when we can buy more than half desired amount
	} else if (ToBuy < buyarg && ToBuy >= buyarg/2) {
		buyarg = ToBuy;
	} 
	else if (ToBuy < buyarg && ToBuy < buyarg/2) {
		log("Why Buy" + " " + ToBuy + item,"red");
		return;
	}
	if (itemCount(item) <= amount) {
		if (!is_moving(character)) {
			if (buying == false) {
				//If we are in the middle of combat. Record our position,
				//so we can come back to it later.
				if (attacking == true) {
					lastPosx = character.x;
					lastPoxy = character.y;
					attacking = false;
				}
				buying = true;
			}
			smart_move(x,y);
			
		}
			//Once we have arrived at the shop, Buy the item, then go back
			//to where we started.
			if (character.x == x && character.y == y) {
				buy(item,buyarg);
				//Move back to where we were.
			   smart_move(lastPosx,lastPoxy);
				//We have bought the item (no longer buying)
				buying = false;
				
			}
	}
	}



/*
beginGrind()
Based on different variables will choose where to go and start grinding out NPC's.
	Strategies:
		if gold & potions are low -> Go To Easy Location
		if Potions and Gold are high -> Go to Hardest location
*/
function beginGrind(minGold,minhpot,minmpot) {
	//Map of difficulty, to arrays of coordinates
	if (!attacking) {
		if (character.g > minGold && itemCount("hpot0") > minhpot &&
			itemCount("hpot0") > minmpot) {
			//Pick closest easy location
		} else {
			
		}
	}
}

/*
upgradeEquipment();
Will automatically upgrade our equipment
*/
function upgradeEquipment() {}



/*
depositGold(limit,quantity)
Once gold reaches the limit, deposit the following quantity into the bank.
*/
function depositGold(limit,quantity) {
	if (character.gold >= limit) {
		if (!is_moving(character)) {
			smart_move("bank",bank_deposit(quantity));
		}
	}
}

/*
Stores every item in the bank except for potions.
*/
function smartStore() {
	var i = 0;
	for (i = 0; i < character.isize; i++) {
		if (character.items[i].name != "hpot0" &&
			character.items[i].name != "hpot1"
			&& character.items[i].name != "mpot0"
			&& character.items[i].name != "mpot1") {
			bank_store(i);
		}
	}
}

/*
When the inventory gets full go to the bank and deposit everything.
except potions
*/
function emptyInventory() {
	if (character.esize == 0) {
		if (!is_moving(character)) {
			smart_move("bank",smartStore());
		}
		
	}
}



//-----------------Character Loop------------------------------
setInterval(function(){
	//log("x :" + character.x + " y :" + character.y + " " + character.map,"yellow");
	//If health potions fall to 10, go and buy 90 more.
	refillItem(10,120,"hpot0",-50.0,-118.0);
	//If Mana Potions fall to 10, go and buy 90 more.
	refillItem(10,120,"mpot0",-50.0,-118);
	//Use mana or health once it falls below 45%
	
	loot();

	if(!attack_mode || character.rip || is_moving(character)) return;
	compAtk();
	
},1000/4); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/learn-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
