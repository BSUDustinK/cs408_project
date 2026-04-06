class Character {
    constructor() {
        this.loadFromLocalStorage();
    }

    loadFromLocalStorage() {
        const saved = JSON.parse(localStorage.getItem('dnd_char_data'));
        this.applyData(saved || {});
    }

    // This is your ONLY applyData function
    applyData(data) {
        this.myname = data.myname || "New Hero";
        this.ac = data.ac || 10;
        this.hp = data.hp || 10;
        this.tmp = data.tmp || 0;
        this.stats = data.stats || { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
        this.notes = data.notes || [];
        this.abilities = data.abilities || [];
        this.actions = data.actions || []; // Added to prevent .map() errors
        if(!data){ localStorage.setItem('dnd_char_data', JSON.stringify(this)); }
    }
    clearData(){
        this.ac =  10;
        this.hp =  10;
        this.tmp =  0;
        this.stats =  { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
        this.notes =  [];
        this.abilities =  [];
        this.actions =  []; // Added to prevent .map() errors
        localStorage.setItem('dnd_char_data', JSON.stringify(this));
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
        if (this.stats[key] !== undefined) {
            this.stats[key] = parseInt(value) || 0;
        } else {
            this[key] = (key === 'myname') ? value : (parseInt(value) || 0);
        }
        this.save();
    }

    addNote(text) {
        if (text.trim()) {
            this.notes.push(text);
            this.save();
        }
    }
}

let myChar = new Character();
window.myChar = myChar;

function render() {
    const root = document.getElementById('character-app');
    root.innerHTML = `
        <div class="character-card">
            <div class="card-name">${myChar.myname}</div>
            
            <div class="stats-header">
            <div class="hp-row">
                    <button onclick="openModal('HP', 'hp')">HP: ${myChar.hp}</button>
                    <button onclick="openModal('TMP', 'tmp')">TMP: ${myChar.tmp}</button>
                </div>
                <div class="name-row">
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
                <button class="btn-add" onclick="openModal('Add Note', 'note')">Add Note</button>
                <div>
                    Act: <input type="checkbox"> 
                    BA: <input type="checkbox">
                </div>
            </div>

            <div class="scroll-area">
                <!-- Wrap Abilities/Actions in the list-item class -->
                ${myChar.actions.map(a => `
                    <div class="list-item action-item">
                        <strong>${a.name}</strong><br>
                        <span style="font-size: 0.9em; color: #444;">${a.desc}</span>
                    </div>
                `).join('')}
                ${myChar.abilities.map(a => `
                    <div class="list-item ability-item">
                        <strong>${a.name}</strong><br>
                        <span style="font-size: 0.9em; color: #444;">${a.desc}</span>
                    </div>
                `).join('')}

                <!-- Wrap Notes in the same list-item class -->
                ${myChar.notes.map(n => `
                    <div class="list-item note-item">
                        ${n}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function openModal(title, key) {
    const overlay = document.getElementById('modal-overlay');
    const noteGroup = document.getElementById('note-input-group');
    const simpleGroup = document.getElementById('simple-input-group');
    const saveBtn = document.getElementById('modal-save-btn');

    document.getElementById('modal-title').innerText = title;
    overlay.classList.remove('hidden');

    if (key === 'note') {
        simpleGroup.classList.add('hidden');
        noteGroup.classList.remove('hidden');
        const area = document.getElementById('note-textarea');
        area.value = "";
        saveBtn.onclick = () => { myChar.addNote(area.value); closeModal(); };

    } else if (key === 'create') {
        noteGroup.classList.add('hidden');
        simpleGroup.classList.remove('hidden');
        const input = document.getElementById('modal-input');
        input.value = "Enter name here";
        saveBtn.onclick = () => { myChar.updateField("myname", input.value); closeModal(); };

    } else {
        noteGroup.classList.add('hidden');
        simpleGroup.classList.remove('hidden');
        const input = document.getElementById('modal-input');
        input.value = myChar.stats[key] || myChar[key];
        saveBtn.onclick = () => { myChar.updateField(key, input.value); closeModal(); };
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}



// ########################## Buttons Functionality ####################################
document.querySelector(".btn-load-char")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete the current character and make a new one?")) {
        document.getElementById('char-upload').click();
    }
});

document.querySelector(".btn-create-char")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete the current character and make a new one?")) {
        localStorage.removeItem('dnd_char_data');
        myChar.updateField("myname", "New Hero");
        myChar.clearData();
        openModal('Name', 'create');
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



const testSave = JSON.parse(localStorage.getItem('dnd_char_data'));
if(testSave){render();}
