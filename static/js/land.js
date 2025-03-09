function analyse() {
    let centre = document.getElementById("centre");
    centre.style.display = "none";
    let div = document.getElementById("book-entire");
    div.style.visibility = "visible";
    setTimeout(() => {
        div.style.opacity = "1";
        div.style.transform = "translateX(-50%) translateY(-100%)";
    }, 10);
    let images = document.getElementsByClassName("laptop");
    for (let i = 0; i < images.length; i++) {
        images[i].style.display = "none";
    }
}

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const book = document.querySelector("#book");
const paper1 = document.querySelector("#p1");
const paper2 = document.querySelector("#p2");

prevBtn.addEventListener("click", goPrevPage);
nextBtn.addEventListener("click", goNextPage);

nextBtn.addEventListener('click', function() {
    const page = document.getElementById('page');
    page.classList.toggle('flip');
});

let currentLocation = 1;
let numOfPapers = 2;
let maxLocation = numOfPapers + 1;

function updateButtonVisibility() {
    prevBtn.style.visibility = (currentLocation === 1) ? "hidden" : "visible";
    nextBtn.style.visibility = (currentLocation === maxLocation) ? "hidden" : "visible";
}

function openBook() {
    book.style.transform = "translateX(50%)";
    prevBtn.style.transform = "translateX(-180px)";
    nextBtn.style.transform = "translateX(180px)";
}

function closeBook(isAtBeginning) {
    book.style.transform = isAtBeginning ? "translateX(0%)" : "translateX(100%)";
    prevBtn.style.transform = "translateX(0px)";
    nextBtn.style.transform = "translateX(0px)";
}

function goNextPage() {
    if (currentLocation < maxLocation) {
        switch (currentLocation) {
            case 1:
                openBook();
                paper1.classList.add("flipped");
                paper1.style.zIndex = 1;
                break;
            case 2:
                paper2.classList.add("flipped");
                paper2.style.zIndex = 2;
                break;
            default:
                throw new Error("Unknown state");
        }
        currentLocation++;
        setTimeout(updateButtonVisibility, 300);
    }
}

function goPrevPage() {
    if (currentLocation > 1) {
        switch (currentLocation) {
            case 2:
                closeBook(true);
                paper1.classList.remove("flipped");
                paper1.style.zIndex = 3;
                break;
            case 3:
                paper2.classList.remove("flipped");
                paper2.style.zIndex = 2;
                break;
            default:
                throw new Error("Unknown state");
        }
        currentLocation--;
        setTimeout(updateButtonVisibility, 300);
    }
}

updateButtonVisibility();

document.addEventListener("DOMContentLoaded", function () {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browse-btn");
    const fileList = document.getElementById("file-list");

    browseBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleFiles);

    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropArea.style.background = "#e3f2fd";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.background = "#fff";
    });

    dropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        dropArea.style.background = "#fff";
        let files = event.dataTransfer.files;
        handleFiles({ target: { files } });
    });

    function handleFiles(event) {
        let files = event.target.files;
        fileList.innerHTML = "";
        for (let file of files) {
            let listItem = document.createElement("p");
            listItem.textContent = `📂 ${file.name}`;
            fileList.appendChild(listItem);
        }
    }
});

async function processDocument() {
    let fileInput = document.getElementById("fileUpload").files[0];
    let prompt = document.getElementById("promptInput").value;

    if (!fileInput || !prompt) {
        alert("Please upload a file and enter a prompt.");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput);
    formData.append("prompt", prompt);

    let response = await fetch("/process", { method: "POST", body: formData });
    let data = await response.json();
    document.getElementById("responseText").innerText = data.response;
}

async function claimReward() {
    let userWallet = await getWalletAddress();
    if (!userWallet) {
        alert("Please connect your wallet first.");
        return;
    }

    let response = await fetch("/update_streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: userWallet })
    });

    let result = await response.json();
    alert(result.message);
    getStreak();
}

async function getStreak() {
    let streakElement = document.getElementById("streakDisplay");
    streakElement.innerText = `Streak: 0 days`;
    try {
        let response = await fetch("/streak");
        let data = await response.json();
        if (data.streak !== undefined) {
            streakElement.innerText = `Streak: ${data.streak} days`;
        }
    } catch (error) {
        console.error("Error fetching streak:", error);
    }
}

async function getRewardBalance() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const userWalletAddress = accounts[0];  
            let response = await fetch(`/reward_balance?wallet=${userWalletAddress}`);
            let data = await response.json();
            document.getElementById("rewardBalanceDisplay").innerText = `Reward Balance: ${data.balance ?? 'Error fetching balance.'}`;
        } catch (error) {
            console.error("Error fetching reward balance:", error);
            document.getElementById("rewardBalanceDisplay").innerText = "Failed to fetch balance.";
        }
    } else {
        alert("MetaMask is not installed.");
    }
}
