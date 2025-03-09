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
    let userWallet = await getWalletAddress(); // Fetch wallet from MetaMask
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
    
    // Refresh streak display
    getStreak();
}


async function getStreak() {
    let streakElement = document.getElementById("streakDisplay");
    streakElement.innerText = `Streak: 0 days`;  // Default to 0 before fetching

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

            if (data.balance !== undefined) {
                document.getElementById("rewardBalanceDisplay").innerText = `Reward Balance: ${data.balance} tokens`;
            } else {
                document.getElementById("rewardBalanceDisplay").innerText = "Error fetching balance.";
            }async function processDocument() {
                let fileInput = document.getElementById("fileUpload").files[0];
            
                if (!fileInput) {
                    alert("Please upload a file.");
                    return;
                }
            
                let formData = new FormData();
                formData.append("file", fileInput);
            
                let response = await fetch("/process", { method: "POST", body: formData });
                let data = await response.json();
            
                if (data.file_url) {
                    document.getElementById("serverImage").src = data.file_url;
                    document.getElementById("serverImage").style.display = "block";
                } else {
                    alert("Upload failed: " + data.error);
                }
            }
            
            function previewImage() {
                let fileInput = document.getElementById("fileUpload").files[0];
            
                if (!fileInput) {
                    alert("Please select an image file.");
                    return;
                }
            
                let reader = new FileReader();
                reader.onload = function (e) {
                    let imgElement = document.getElementById("uploadedImage");
                    imgElement.src = e.target.result;
                    imgElement.style.display = "block"; // Show the preview image
                };
            
                reader.readAsDataURL(fileInput);
            }
            
        } catch (error) {
            console.error("Error fetching reward balance:", error);
            document.getElementById("rewardBalanceDisplay").innerText = "Failed to fetch balance.";
        }
    } else {
        alert("MetaMask is not installed.");
    }
}




