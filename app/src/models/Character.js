class name {
    constructor(characterName) {
        this.characterName = characterName;
        this.creatureType = "";
        this.stats = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10, 
            wisdom: 10,
            charisma: 10
        };

        this.hp = {
            current: 10,
            max: 10,
            temp: 0
        };
        this.armourClass = 10 + this.statMod(dexterity); 
        this.isAPLayer = false;
        this.profBonus = 0;

        this.abilities = [];
        this.actions = [];
        this.notes = [];

        this.inventory = []; 
        this.challengeRating = 0; // factor * 1/16


        // 0, 1, 2, 3 is a multiplier for proficiency, for expertise or beyond
        this.skillModifiers = {
            // Strength-based skills
            athletics: 0,
            // Dexterity-based skills
            acrobatics: 0,
            sleightOfHand: 0,
            stealth: 0,
            // Intelligence-based skills
            arcana: 0,
            history: 0,
            investigation: 0,
            nature: 0,
            religion: 0,
            // Wisdom-based skills
            animalHandling: 0,
            insight: 0,
            medicine: 0,
            perception: 0,
            survival: 0,
            // Charisma-based skills
            deception: 0,
            intimidation: 0,
            performance: 0,
            persuasion: 0
        };

    }


    //Download
    downloadItem() {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    }

    //abilities[] = {name, description}, {name, description}
    addAbility(abilityName, abilityDescription){
        this.abilities.push({abilityName, abilityDescription})
    }

    //actions[] = {name, description}, {name, description}
    addActions(actionsName, actionsDescription){
        this.actions.push({actionsName, actionsDescription})
    }

    //inventory[] = {name, description}, {name, description}
    addToInventory(inventoryName, inventoryDescription){
        this.inventory.push({inventoryName, inventoryDescription})
    }

    addNote(noteText){
        this.notes.push(noteText)
    }
    

    statMod(statValue){
        return Math.floor((statValue - 10) / 2);
    }




    
    
}