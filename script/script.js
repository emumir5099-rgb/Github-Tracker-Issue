const container = document.getElementById('issues-container');
const searchInput = document.getElementById('searchInput');
let allIssues = []; 

const loadInitialData = () => {
    container.innerHTML = '<p class="text-center col-span-full py-10 text-gray-400 font-bold">Loading Issues...</p>';
    fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues')
        .then(res => res.json())
        .then(result => {
            allIssues = result.data; 
            displayIssues(allIssues);
            updateIssueCount(allIssues.length); 
        })
        .catch(err => {
            container.innerHTML = '<p class="text-red-500 text-center col-span-full">ডাটা লোড করতে সমস্যা হয়েছে!</p>';
        });
};

const displayIssues = (issues) => {
    container.innerHTML = '';
    if (issues.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full py-10 text-gray-400">No issues found!</p>';
        return;
    }

    issues.forEach(issue => {
        const borderClass = issue.status === 'open' ? 'border-[#22C55E]' : 'border-[#5200FF]';
        const priorityText = issue.priority || "HIGH";
        let priorityBg = "bg-[#FEF2F2] text-[#EF4444]"; 
        if(priorityText.toLowerCase() === 'medium') priorityBg = "bg-[#FFF7ED] text-[#F97316]";
        if(priorityText.toLowerCase() === 'low') priorityBg = "bg-[#F1F5F9] text-[#64748B]";

        const card = document.createElement('div');
        card.className = `bg-white rounded-[12px] border-t-[6px] ${borderClass} shadow-sm border-x border-b border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden`;
        
        card.innerHTML = `
            <div class="p-5 flex-grow">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-8 h-8 rounded-full border-2 border-dashed border-green-400 flex items-center justify-center opacity-70">
                        <div class="w-3 h-3 rounded-full border-2 border-green-500"></div>
                    </div>
                    <span class="${priorityBg} text-[11px] font-bold px-4 py-1.5 rounded-full uppercase">${priorityText}</span>
                </div>
                <h3 class="font-bold text-[#1A1F2C] text-[17px] mb-2 leading-tight">${issue.title}</h3>
                <p class="text-slate-500 text-[14px] mb-6 line-clamp-2">${issue.description}</p>
                <div class="flex gap-2">
                    <div class="bg-[#FEF2F2] text-[#EF4444] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-red-100"><span>🤖</span> BUG</div>
                    <div class="bg-[#FFF7ED] text-[#F97316] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-orange-100"><span>🧱</span> HELP WANTED</div>
                </div>
            </div>
            <div class="bg-white px-5 py-4 border-t border-gray-100 mt-auto">
                <p class="text-[13px] text-slate-500 font-medium">#1 by <span class="text-slate-700">${issue.author}</span></p>
                <p class="text-[13px] text-slate-400 mt-1">${new Date(issue.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
        `;

        card.onclick = () => openModal(issue.id);
        container.appendChild(card);
    });
};

const updateIssueCount = (count) => {
    const countEl = document.getElementById("issueCount");
    if(countEl) countEl.innerText = `${count} Issues`; 
};

const showAll = () => { displayIssues(allIssues); updateIssueCount(allIssues.length); };
const showOpen = () => { const d = allIssues.filter(i => i.status === 'open'); displayIssues(d); updateIssueCount(d.length); };
const showClosed = () => { const d = allIssues.filter(i => i.status === 'closed'); displayIssues(d); updateIssueCount(d.length); };

const searchIssues = () => {
    const searchText = searchInput.value;
    if (!searchText) { showAll(); return; }
    fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`)
        .then(res => res.json())
        .then(data => { displayIssues(data.data); updateIssueCount(data.data.length); });
};

const openModal = (id) => {
    fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`)
        .then(res => res.json())
        .then(result => {
            const data = result.data;
            document.getElementById('modalTitle').innerText = data.title;
            document.getElementById('modalDesc').innerText = data.description || "No description provided.";
            document.getElementById('modalStatus').innerText = data.status === 'open' ? 'Opened' : 'Closed';
            document.getElementById('modalMeta').innerText = `• Opened by ${data.author} • ${new Date(data.createdAt).toLocaleDateString('en-GB')}`;
            document.getElementById('modalAssignee').innerText = data.author;
            document.getElementById('modalPriority').innerText = data.priority || "HIGH";
            
            const tagContainer = document.getElementById('modalTags');
            tagContainer.innerHTML = `
                <div class="bg-[#FEF2F2] text-[#EF4444] text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-red-50"><span>🤖</span> BUG</div>
                <div class="bg-[#FFF7ED] text-[#F97316] text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-orange-50"><span>🧱</span> HELP WANTED</div>
            `;
            document.getElementById('modal').classList.replace('hidden', 'flex');
        });
};

const closeModal = () => document.getElementById('modal').classList.replace('flex', 'hidden');

loadInitialData();