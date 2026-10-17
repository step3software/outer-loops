# Executable action catalog

This is an inventory of the **157 registered actions** in `actionList.js` at the documentation baseline (October 17, 2026), grouped by zero-based zone. It documents source definitions rather than `data/actionList.xml` editor content.

**Maintenance:** Update rows when adding/removing/renaming executable actions. `npm run check` verifies that the set of `Action.*` IDs matches current source, but does not verify balance or every type/zone value. Factory-defined Survey, Ruins and Haul actions are resolved to their actual constructor arguments; assassin actions inherit multipart behavior.

Type is one of `normal`, `progress`, `limited` or `multipart`. Constructor identifies the class/factory path. See [gameplay](../gameplay.md) for field semantics and [change recipes](../development/recipes.md) for implementation.

## 0 — Beginnersville (25)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AssassinZ0` | AssassinZ0 | `multipart` | `AssassinAction` |
| `Action.BuyGlasses` | Buy Glasses | `normal` | `Action` |
| `Action.BuyManaZ1` | Buy Mana Z1 | `normal` | `Action` |
| `Action.BuySupplies` | Buy Supplies | `normal` | `Action` |
| `Action.FightMonsters` | Fight Monsters | `multipart` | `MultipartAction` |
| `Action.FoundGlasses` | Found Glasses | `normal` | `Action` |
| `Action.Haggle` | Haggle | `normal` | `Action` |
| `Action.HealTheSick` | Heal The Sick | `multipart` | `MultipartAction` |
| `Action.HitchRide` | Hitch Ride | `normal` | `Action` |
| `Action.Investigate` | Investigate | `progress` | `Action` |
| `Action.LongQuest` | Long Quest | `limited` | `Action` |
| `Action.MageLessons` | Mage Lessons | `normal` | `Action` |
| `Action.Map` | Map | `normal` | `Action` |
| `Action.MeetPeople` | Meet People | `progress` | `Action` |
| `Action.OpenRift` | Open Rift | `normal` | `Action` |
| `Action.PickLocks` | Pick Locks | `limited` | `Action` |
| `Action.ShortQuest` | Short Quest | `limited` | `Action` |
| `Action.SmallDungeon` | Small Dungeon | `multipart` | `DungeonAction` |
| `Action.SmashPots` | Smash Pots | `limited` | `Action` |
| `Action.StartJourney` | Start Journey | `normal` | `Action` |
| `Action.SurveyZ0` | SurveyZ0 | `progress` | `Action (SurveyAction)` |
| `Action.ThrowParty` | Throw Party | `normal` | `Action` |
| `Action.TrainStrength` | Train Strength | `normal` | `Action` |
| `Action.Wander` | Wander | `progress` | `Action` |
| `Action.WarriorLessons` | Warrior Lessons | `normal` | `Action` |

## 1 — Forest Path (23)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AssassinZ1` | AssassinZ1 | `multipart` | `AssassinAction` |
| `Action.BirdWatching` | Bird Watching | `normal` | `Action` |
| `Action.BrewPotions` | Brew Potions | `normal` | `Action` |
| `Action.ClearThicket` | Clear Thicket | `progress` | `Action` |
| `Action.ContinueOn` | Continue On | `normal` | `Action` |
| `Action.DarkMagic` | Dark Magic | `normal` | `Action` |
| `Action.DarkRitual` | Dark Ritual | `multipart` | `MultipartAction` |
| `Action.ExploreForest` | Explore Forest | `progress` | `Action` |
| `Action.FollowFlowers` | Follow Flowers | `progress` | `Action` |
| `Action.GatherHerbs` | Gather Herbs | `limited` | `Action` |
| `Action.HaulZ1` | HaulZ1 | `limited` | `Action (HaulAction)` |
| `Action.Hunt` | Hunt | `limited` | `Action` |
| `Action.LearnAlchemy` | Learn Alchemy | `normal` | `Action` |
| `Action.OldShortcut` | Old Shortcut | `progress` | `Action` |
| `Action.PracticalMagic` | Practical Magic | `normal` | `Action` |
| `Action.RuinsZ1` | RuinsZ1 | `progress` | `Action (RuinsAction)` |
| `Action.SitByWaterfall` | Sit By Waterfall | `normal` | `Action` |
| `Action.SurveyZ1` | SurveyZ1 | `progress` | `Action (SurveyAction)` |
| `Action.TalkToHermit` | Talk To Hermit | `progress` | `Action` |
| `Action.TalkToWitch` | Talk To Witch | `progress` | `Action` |
| `Action.TrainDexterity` | Train Dexterity | `normal` | `Action` |
| `Action.TrainSpeed` | Train Speed | `normal` | `Action` |
| `Action.WildMana` | Wild Mana | `limited` | `Action` |

## 2 — Merchanton (20)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AdventureGuild` | Adventure Guild | `multipart` | `MultipartAction` |
| `Action.Apprentice` | Apprentice | `progress` | `Action` |
| `Action.Architect` | Architect | `progress` | `Action` |
| `Action.AssassinZ2` | AssassinZ2 | `multipart` | `AssassinAction` |
| `Action.BuyManaZ3` | Buy Mana Z3 | `normal` | `Action` |
| `Action.BuyPickaxe` | Buy Pickaxe | `normal` | `Action` |
| `Action.CraftArmor` | Craft Armor | `normal` | `Action` |
| `Action.CraftingGuild` | Crafting Guild | `multipart` | `MultipartAction` |
| `Action.ExploreCity` | Explore City | `progress` | `Action` |
| `Action.Gamble` | Gamble | `limited` | `Action` |
| `Action.GatherTeam` | Gather Team | `normal` | `Action` |
| `Action.GetDrunk` | Get Drunk | `progress` | `Action` |
| `Action.HeroesTrial` | Heroes Trial | `multipart` | `TrialAction` |
| `Action.LargeDungeon` | Large Dungeon | `multipart` | `DungeonAction` |
| `Action.Mason` | Mason | `progress` | `Action` |
| `Action.ReadBooks` | Read Books | `normal` | `Action` |
| `Action.SellPotions` | Sell Potions | `normal` | `Action` |
| `Action.StartTrek` | Start Trek | `normal` | `Action` |
| `Action.SurveyZ2` | SurveyZ2 | `progress` | `Action (SurveyAction)` |
| `Action.Underworld` | Underworld | `normal` | `Action` |

## 3 — Mt. Olympus (19)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AssassinZ3` | AssassinZ3 | `multipart` | `AssassinAction` |
| `Action.CheckWalls` | Check Walls | `progress` | `Action` |
| `Action.Chronomancy` | Chronomancy | `normal` | `Action` |
| `Action.ClimbMountain` | Climb Mountain | `progress` | `Action` |
| `Action.DecipherRunes` | Decipher Runes | `progress` | `Action` |
| `Action.ExploreCavern` | Explore Cavern | `progress` | `Action` |
| `Action.FaceJudgement` | Face Judgement | `normal` | `Action` |
| `Action.Guru` | Guru | `normal` | `Action` |
| `Action.HaulZ3` | HaulZ3 | `limited` | `Action (HaulAction)` |
| `Action.HuntTrolls` | Hunt Trolls | `multipart` | `MultipartAction` |
| `Action.ImbueBody` | Imbue Body | `multipart` | `MultipartAction` |
| `Action.ImbueMind` | Imbue Mind | `multipart` | `MultipartAction` |
| `Action.LoopingPotion` | Looping Potion | `normal` | `Action` |
| `Action.ManaGeyser` | Mana Geyser | `limited` | `Action` |
| `Action.MineSoulstones` | Mine Soulstones | `limited` | `Action` |
| `Action.Pyromancy` | Pyromancy | `normal` | `Action` |
| `Action.RuinsZ3` | RuinsZ3 | `progress` | `Action (RuinsAction)` |
| `Action.SurveyZ3` | SurveyZ3 | `progress` | `Action (SurveyAction)` |
| `Action.TakeArtifacts` | Take Artifacts | `limited` | `Action` |

## 4 — Valhalla (25)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AcceptDonations` | Accept Donations | `limited` | `Action` |
| `Action.AssassinZ4` | AssassinZ4 | `multipart` | `AssassinAction` |
| `Action.BuildHousing` | Build Housing | `normal` | `Action` |
| `Action.BuyManaZ5` | Buy Mana Z5 | `normal` | `Action` |
| `Action.Canvass` | Canvass | `progress` | `Action` |
| `Action.CharmSchool` | Charm School | `normal` | `Action` |
| `Action.CollectTaxes` | Collect Taxes | `normal` | `Action` |
| `Action.Donate` | Donate | `normal` | `Action` |
| `Action.EnchantArmor` | Enchant Armor | `normal` | `Action` |
| `Action.FallFromGrace` | Fall From Grace | `normal` | `Action` |
| `Action.FightFrostGiants` | Fight Frost Giants | `multipart` | `MultipartAction` |
| `Action.GiftArtifact` | Gift Artifact | `normal` | `Action` |
| `Action.GreatFeast` | Great Feast | `multipart` | `MultipartAction` |
| `Action.GuidedTour` | Guided Tour | `progress` | `Action` |
| `Action.Mercantilism` | Mercantilism | `normal` | `Action` |
| `Action.Oracle` | Oracle | `normal` | `Action` |
| `Action.Pegasus` | Pegasus | `normal` | `Action` |
| `Action.Restoration` | Restoration | `normal` | `Action` |
| `Action.SeekBlessing` | Seek Blessing | `normal` | `Action` |
| `Action.SeekCitizenship` | Seek Citizenship | `progress` | `Action` |
| `Action.SellArtifact` | Sell Artifact | `normal` | `Action` |
| `Action.Spatiomancy` | Spatiomancy | `normal` | `Action` |
| `Action.SurveyZ4` | SurveyZ4 | `progress` | `Action (SurveyAction)` |
| `Action.TidyUp` | Tidy Up | `multipart` | `MultipartAction` |
| `Action.WizardCollege` | Wizard College | `multipart` | `MultipartAction` |

## 5 — Startington (13)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AssassinZ5` | AssassinZ5 | `multipart` | `AssassinAction` |
| `Action.DarkSacrifice` | Dark Sacrifice | `normal` | `Action` |
| `Action.DeadTrial` | Dead Trial | `multipart` | `TrialAction` |
| `Action.DestroyPylons` | Destroy Pylons | `limited` | `Action` |
| `Action.HaulZ5` | HaulZ5 | `limited` | `Action (HaulAction)` |
| `Action.JourneyForth` | Journey Forth | `normal` | `Action` |
| `Action.ManaWell` | Mana Well | `limited` | `Action` |
| `Action.Meander` | Meander | `progress` | `Action` |
| `Action.PurchaseSupplies` | Purchase Supplies | `normal` | `Action` |
| `Action.RaiseZombie` | Raise Zombie | `normal` | `Action` |
| `Action.RuinsZ5` | RuinsZ5 | `progress` | `Action (RuinsAction)` |
| `Action.SurveyZ5` | SurveyZ5 | `progress` | `Action (SurveyAction)` |
| `Action.TheSpire` | The Spire | `multipart` | `DungeonAction` |

## 6 — Jungle Path (11)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AssassinZ6` | AssassinZ6 | `multipart` | `AssassinAction` |
| `Action.Escape` | Escape | `normal` | `Action` |
| `Action.ExploreJungle` | Explore Jungle | `progress` | `Action` |
| `Action.FightJungleMonsters` | Fight Jungle Monsters | `multipart` | `MultipartAction` |
| `Action.HaulZ6` | HaulZ6 | `limited` | `Action (HaulAction)` |
| `Action.OpenPortal` | Open Portal | `normal` | `Action` |
| `Action.PrepareBuffet` | Prepare Buffet | `normal` | `Action` |
| `Action.RescueSurvivors` | Rescue Survivors | `multipart` | `MultipartAction` |
| `Action.RuinsZ6` | RuinsZ6 | `progress` | `Action (RuinsAction)` |
| `Action.SurveyZ6` | SurveyZ6 | `progress` | `Action (SurveyAction)` |
| `Action.Totem` | Totem | `normal` | `Action` |

## 7 — Commerceville (15)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.AssassinZ7` | AssassinZ7 | `multipart` | `AssassinAction` |
| `Action.CollectInterest` | Collect Interest | `normal` | `Action` |
| `Action.Excursion` | Excursion | `progress` | `Action` |
| `Action.ExplorersGuild` | Explorers Guild | `normal` | `Action` |
| `Action.GuildAssassin` | Guild Assassin | `normal` | `Action` |
| `Action.InsuranceFraud` | Insurance Fraud | `progress` | `Action` |
| `Action.Invest` | Invest | `normal` | `Action` |
| `Action.LeaveCity` | Leave City | `normal` | `Action` |
| `Action.PickPockets` | Pick Pockets | `progress` | `Action` |
| `Action.PurchaseKey` | Purchase Key | `normal` | `Action` |
| `Action.RobWarehouse` | Rob Warehouse | `progress` | `Action` |
| `Action.SecretTrial` | Secret Trial | `multipart` | `TrialAction` |
| `Action.Seminar` | Seminar | `normal` | `Action` |
| `Action.SurveyZ7` | SurveyZ7 | `progress` | `Action (SurveyAction)` |
| `Action.ThievesGuild` | Thieves Guild | `multipart` | `MultipartAction` |

## 8 — Valley of Olympus (6)

| Action ID | Name | Type | Constructor |
| --- | --- | --- | --- |
| `Action.BuildTower` | Build Tower | `progress` | `Action` |
| `Action.ChallengeGods` | Challenge Gods | `multipart` | `TrialAction` |
| `Action.GodsTrial` | Gods Trial | `multipart` | `TrialAction` |
| `Action.ImbueSoul` | Imbue Soul | `multipart` | `MultipartAction` |
| `Action.RestoreTime` | Restore Time | `normal` | `Action` |
| `Action.SurveyZ8` | SurveyZ8 | `progress` | `Action (SurveyAction)` |
