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
        if (typeof render === 'function') render();
    }

    exportToFile() {
        const dataStr = JSON.stringify(this, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.myname.replace(/\s+/g, '_')}_sheet.json`;
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
} 

let myChar = new Character();
window.myChar = myChar;
var newCharacterCreated = false;

function render() {
    const root = document.getElementById('character-app');
    root.innerHTML = `
        <div class="character-card">
            <div class="card-name">${myChar.myname}</div>
            
                <div class="stats-header">
                    <div class="hp-row">
                        <button class="hp-button" onclick="openModal('HP', 'hp')">HP: ${myChar.hp.current}</button>
                        <button onclick="openModal('AC', 'ac')">AC: ${myChar.ac}</button>
                    </div>
                
                </div>

            <div class="ability-grid">
                ${Object.keys(myChar.stats).map(s => `
                    <button onclick="openModal('${s}', '${s}')">
                        ${s} <span>${myChar.stats[s]}</span>
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
                ${myChar.notes.map(n => `
                    <div class="list-item note-item">
                        ${n}
                    </div>
                `).join('')}

                <!-- Wrap Actions in the list-item class -->
                ${myChar.actions.map(a => `
                    <div class="list-item action-item">
                        <strong>${a.name}</strong><br>
                        <span style="font-size: 0.9em; color: #444;">${a.desc}</span>
                    </div>
                `).join('')}

                <!-- Wrap Abilities in the list-item class -->
                ${myChar.abilities.map(a => `
                    <div class="list-item ability-item">
                        <strong>${a.name}</strong><br>
                        <span style="font-size: 0.9em; color: #444;">${a.desc}</span>
                    </div>
                `).join('')}

            </div>
        </div>
    `;
}
// ##########################   MODAL Components     ####################################

// Toggles Ability and Action
const abilityToggle = document.getElementById('ability-toggle-button'); 
const abilityToggleText = document.getElementById('ability-toggle-label'); 
function toggleAbility(){
    abilityToggle.classList.toggle('ability');
    abilityToggleText.innerHTML = abilityToggleText.innerHTML === 'Ability'? 'Action':'Ability'; //Toggles the Label's text between Action or Ability
}

// ##########################    MODAL Functionality     ####################################

function openModal(title, key) {
    const overlay = document.getElementById('modal-overlay'); //Main container

    //Each mode of operation
    const noteGroup = document.getElementById('note-input-group');
    const simpleGroup = document.getElementById('simple-input-group');
    const hpGroup = document.getElementById('hp-input-group');
    const abilityGroup = document.getElementById('ability-input-group');
    const createEditGroup = document.getElementById('create-edit-group');

    //Toggle each mode off to ensure proper display
    noteGroup.classList.add('hidden');
    simpleGroup.classList.add('hidden');
    createEditGroup.classList.add('hidden');
    hpGroup.classList.add('hidden');
    abilityGroup.classList.add('hidden');

    const saveBtn = document.getElementById('modal-save-btn'); 
    const cancelBtn = document.getElementById('modal-btn-cancel');


    const targetCharacter = document.getElementById('character-app');

    //Display Modal Menu
    document.getElementById('modal-title').innerText = title;
    overlay.classList.remove('hidden');

    //Add Modal input functions based on implementation
    if (key === 'note') {
        noteGroup.classList.remove('hidden');
        const area = document.getElementById('note-textarea');
        area.value = "";
        saveBtn.onclick = () => { myChar.addNote(area.value); closeModal(); };

    } else if (key === 'ability') {
        abilityGroup.classList.remove('hidden');

        const nameInput = document.getElementById('ability-name-input');
        nameInput.defaultValue = myChar.hp.current;

        const descriptionInput = document.getElementById('ability-description-textarea');
        descriptionInput.defaultValue = "Enter the description";

        //Future implementation !required ?optional
        /** 
         * Action
         *  ! Name: String
         *  ! Description: String (Should include a full description of the ability and any save DC effects) 
         *  ? Cost: 'action', 'bonus-action', 'reaction', 'legendary-action', 'free-action'
         *  ? Roll: SkillCheck (Use skill list, attack mods, or save checks)
         *  ? Damage: { DamageDie , Quantity, Mod }
         */
        
        saveBtn.onclick = () => { 
            if(abilityToggleText.innerHTML === 'Ability'){
                newAbility = {
                    name: nameInput.value, 
                    desc: descriptionInput.value
                }
                 myChar.addAbility(newAbility); 

            }else{
                newAction = {
                    name: nameInput.value, 
                    desc: descriptionInput.value
                }
                myChar.addAction(newAction); 
            }
            
           
            closeModal(); 
        };
      
    } else if (key === 'hp') {
        hpGroup.classList.remove('hidden');
        const tmpHpInput = document.getElementById('tmp-hp-input');
        tmpHpInput.defaultValue = myChar.hp.tmp;

        const currentHpInput = document.getElementById('current-hp-input');
        currentHpInput.defaultValue = myChar.hp.current;

        const maxHpInput = document.getElementById('max-hp-input');
        maxHpInput.defaultValue = myChar.hp.max;

        saveBtn.onclick = () => { 
            newHP = { max: maxHpInput.value, current: currentHpInput.value, tem: tmpHpInput.value }
            myChar.updateField("hp", newHP); 
            closeModal(); 
        };

    }else if (key === 'create') {
        newCharacterCreated = false;
        targetCharacter.classList.add('hidden');
        createEditGroup.classList.remove('hidden');

        const nameInput = document.getElementById('name-input');
        nameInput.placeholder = "Enter name here";
        const lvlInput = document.getElementById('lvl-input');
        lvlInput.placeholder = "1";
        const hpInput = document.getElementById('hp-input');
        hpInput.placeholder = "10";
        const acInput = document.getElementById('ac-input');
        acInput.placeholder = "10";

        const strInput = document.getElementById('str-input');
        strInput.placeholder = "10";
        const dexInput = document.getElementById('dex-input');
        dexInput.placeholder = "10";
        const conInput = document.getElementById('con-input');
        conInput.placeholder = "10";
        const intInput = document.getElementById('int-input');
        intInput.placeholder = "10";
        const wisInput = document.getElementById('wis-input');
        wisInput.placeholder = "10";
        const chaInput = document.getElementById('cha-input');
        chaInput.placeholder = "10";

        saveBtn.onclick = () => { 
            newCharacterCreated = true;
            
            newChar = {
                myname: nameInput.value,
                chaLvl: lvlInput.value,
                hp: { max: hpInput.value, current: hpInput.value, tmp: 0 },
                ac: acInput.value,
                stats: { STR: strInput.value, DEX: dexInput.value, CON: conInput.value, INT: intInput.value, WIS: wisInput.value, CHA: chaInput.value }//,

                //notes: data.notes || [],
                //abilities: data.abilities || [],
                //actions:  data.actions || []
            }
            myChar.applyData(newChar);
            myChar.save();
            targetCharacter.classList.remove('hidden');
            closeModal(); 
        }; 
    } else {
        simpleGroup.classList.remove('hidden');
        const input = document.getElementById('modal-input');
        input.value = myChar.stats[key] || myChar[key];
        saveBtn.onclick = () => { myChar.updateField(key, input.value); closeModal(); };
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ########################## Tests for and displays last session data ####################################
const testSave = JSON.parse(localStorage.getItem('dnd_char_data'));
if(testSave){render();}




// ########################## TOOLBAR Buttons Functionality for Player View ####################################

function verifyOverwrite(){
    if(!testSave && !newCharacterCreated) { return true; } //Checks to see if their are no existing objects
    if(confirm("Are you sure you want to delete the current character and make a new one?")){ //Checks to see if 
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
        render();
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
            
            // Clear input so the same file can be uploaded again if needed
            e.target.value = ""; 
        } catch (error) {
            alert("Error: Could not parse character file. Make sure it is valid JSON.");
        }
    };
    reader.readAsText(file);
    render();
});

document.querySelector(".btn-export-char")?.addEventListener("click", () => {
    myChar.exportToFile();
});

// document.querySelector(".btn-clear-char").addEventListener("click", () => {
//     myChar.resetCharacter();
//     render();
// }); //For Testing






// Adds toggle functionality
const toggleButtons = document.querySelectorAll('.toggle-button');
toggleButtons.forEach(toggle => {
    toggle.addEventListener('click',() => {
        toggle.classList.toggle('active');
    });
});
