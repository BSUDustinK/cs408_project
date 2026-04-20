/**
 * The main class for the program to utilize across each page to display character cards. 
 * 
 *  Internal Data:
 *      Name
 *      Character Lvl
 *      HP{ Max, Current ,Temp }
 *      AC
 *      STATS{ STR, DEX, CON, INT, WIS, CHA }
 */
class Character {
    /**
     * 
     * @param String characterFileName provides access to server to reload each local character in from memory. 
     *      For the player view this will be dnd_char_data as provided by default value. However the Host view will save
     *      a list of names to its variables. each 
     */
    constructor(characterFileName = 'dnd_char_data') {
        this.loadFromLocalStorage(characterFileName);
    }

    loadFromLocalStorage(file) {
        try{
            const saved = JSON.parse(localStorage.getItem(file));
            this.applyData(saved || {});
        } catch{
            alert("Local file may be corrupted")
        }
        
    }

    // Applies updates to the character with the json information
    applyData(data) {
        this.myname = data.myname || " ";
        this.chaLvl = data.chaLvl || 1;
        this.ac = data.ac || 10;
        this.hp = data.hp || { max: 10, current: 10, tmp: 0 };

        this.stats = data.stats || { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };

        this.notes = data.notes || [];
        this.abilities = data.abilities || [];
        this.actions = data.actions || []; 
    }
    clearData(){
        this.applyData({});
    }

    save() {
        localStorage.setItem('dnd_char_data', JSON.stringify(this));
        render();
    }

    exportToFile() {
        const dataStr = JSON.stringify(this, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.myname.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\s+/g, '_')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    resetCharacter() {
        if (confirm("Are you sure you want to delete this character?")) {
            localStorage.removeItem('dnd_char_data');
            location.reload();
        }
    }

    updateField(key, value) {
        if(Number.isInteger(value)){
            this[key] = (parseInt(value) || 0); //Handles ints for hp, stats, mods, and more
        } else {
            this[key] = value; //Handles strings, objects, and all others
        }
        this.save();
    }
    removeNote(note){
        if(!note){return;}
        this.notes = this.notes.filter(noteItem => noteItem !== note);
        this.save();
    }

    addNote(text) {
        if (text.trim()) {
            this.notes.push(text);
            this.save();
        }
    }
    addAbility(ability) {
        this.abilities.push(ability);
        this.save();
    }
    addAction(action) {
        this.actions.push(action);
        this.save();
    }

    render(characterId = 'character-app') {
    const root = document.getElementById(characterId);
    root.innerHTML = `
        <div class="character-card">
            <div class="card-name">${this.myname}</div>
            
                <div class="stats-header">
                    <div class="hp-row">
                        <button class="hp-button" onclick="openModal('HP', 'hp')">HP: ${this.hp.current}</button>
                        <button onclick="openModal('AC', 'ac')">AC: ${this.ac}</button>
                    </div>
                
                </div>

            <div class="ability-grid">
                ${Object.keys(this.stats).map(s => `
                    <button onclick="openModal('${s}', '${s}')">
                        ${s} <span>${this.stats[s]}</span>
                    </button>
                `).join('')}
            </div>

            <div class="actions-bar">
                <button class="btn-add" onclick="openModal('Add Ability', 'ability')">Add Ability</button>
                <button class="btn-add" onclick="openModal('Add Note', 'note')">Add Note</button>
                <div>
                    Act: <input type="checkbox"> 
                    BA: <input type="checkbox">
                </div>
            </div>

            <div class="scroll-area">
                

                <!-- Wrap Notes in the same list-item class -->
                ${this.notes.map(n => `
                    <div class="list-item note-item">
                        ${n}
                        <button class="delete-button ${this.name}-delete-note" onclick="deleteNote(${n})">⨉</button>
                    </div>
                `).join('')}

                <!-- Wrap Actions in the list-item class -->
                ${this.actions.map(a => `
                    <div class="list-item action-item">
                        <strong>${a.name}</strong><br>
                        <span style="font-size: 0.9em; color: #444;">${a.desc}</span>
                    </div>
                `).join('')}

                <!-- Wrap Abilities in the list-item class -->
                ${this.abilities.map(a => `
                    <div class="list-item ability-item">
                        <strong>${a.name}</strong><br>
                        <span style="font-size: 0.9em; color: #444;">${a.desc}</span>
                    </div>
                `).join('')}

            </div>
        </div>
    `;
    }
}
class Encounter {
    constructor(fileToLoad = 'last_encounter_data'){
        this.loadFromLocalStorage(fileToLoad);
    }
    loadFromLocalStorage(file) {
        try{
            const saved = JSON.parse(localStorage.getItem(file));
            this.applyData(saved || {});
        } catch{
            alert("Local file may be corrupted")
        }
        
    }

    // Strictly loads in the data from a previous save
    applyData(data){
        this.characters = data.characters || [];
        this.notes = data.notes || [];
    }
    // Strictly clears data
    clearData(){
        this.applyData({});
        this.clearWindow();
    }
    clearWindow(){
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {    card.remove();  });
    }
    // Removes all enemies
    clearEnemies(){
        this.characters.forEach(character => {
            if(character.isNPC === true){ 
                const NPC = document.getElementById(character.id); 
                NPC.remove();
                this.characters = this.characters.filter(character => character.id === character.id);
            }
        });
    }
    // Strictly saves
    save() {
        localStorage.setItem('last_encounter_data', JSON.stringify(this));
    }

    exportToFile() {
        const dataStr = JSON.stringify(this, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Encounter_${new Date().toLocaleDateString().replace(/\s+/g, '_')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    resetCharacter() {
        if (confirm("Are you sure you want to delete this character?")) {
            localStorage.removeItem('dnd_char_data');
            location.reload();
        }
    }

    render(){
        const root = document.getElementById('tracker-view');
        this.clearWindow();
        this.characters.forEach(character => {
            root.innerHTML += `
                <div class="character-card" id="character-${character.id}">  </div>
            `;});
    }


    //Character fields 
    updateField(key, value) {
        if(Number.isInteger(value)){
            this[key] = (parseInt(value) || 0); //Handles ints for hp, stats, mods, and more
        } else {
            this[key] = value; //Handles strings, objects, and all others
        }
        this.save();
    }
    removeNote(note){
        if(!note){return;}
        this.notes = this.notes.filter(noteItem => noteItem !== note);
        this.save();
    }

    addNote(text) {
        if (text.trim()) {
            this.notes.push(text);
            this.save();
        }
    }
}



// ########################## Tests for and displays last session data ####################################

let activeEncounter = new Encounter(); //Instantiation checks for previous save or generates a new environment
window.activeEncounter = activeEncounter; 

const testSave = JSON.parse(localStorage.getItem('last_encounter_data'));
if(testSave){ activeEncounter.render(); } 


// ########################## TOOLBAR & Button Functionality for Host View ####################################

//Important Window functionalities
//Adds toggle functionality
const toggleButtons = document.querySelectorAll('.toggle-button');
toggleButtons.forEach(toggle => {
    toggle.addEventListener('click',() => {
        toggle.classList.toggle('active');
    });
});



function verifyOverwrite(){
    if(!testSave && !newCharacterCreated) { return true; } //Checks to see if their are no existing objects
    if(confirm("Are you sure you want to delete the current character and make a new one?")){ //Checks to see if 
        newCharacterCreated = false;
        return true;
    }
    return false; 
}

document.querySelector(".btn-load-char")?.addEventListener("click", () => {
    if (verifyOverwrite()) {
        document.getElementById('char-upload').click();
    }
});

document.querySelector(".btn-create-char")?.addEventListener("click", () => {
    if(verifyOverwrite()){
        localStorage.removeItem('dnd_char_data');
        myChar.clearData();
        openModal('New Character', 'create');
        myChar.render();
    } 
});

document.getElementById('char-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const jsonString = event.target.result;
            const data = JSON.parse(jsonString);
            
            // Apply the uploaded data to your character instance
            myChar.applyData(data);
            myChar.save();
            newCharacterCreated = true;
            document.getElementById('character-app').classList.remove('hidden');
            // Clear input so the same file can be uploaded again if needed
            e.target.value = ""; 
        } catch (error) {
            alert("Error: Could not parse character file. Make sure it is valid JSON.");
        }
    };
    reader.readAsText(file);
    myChar.render();
});

document.querySelector(".btn-export-char")?.addEventListener("click", () => {
    myChar.exportToFile();
});