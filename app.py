import os
import io
import json
import time
import tempfile
from flask import Flask, render_template, request, jsonify, session
from web3 import Web3
from dotenv import load_dotenv
from PIL import Image
import fitz  # PyMuPDF
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
app.secret_key = "your_secret_key"  # Change this in production

# Configure Google Gemini AI
genai.configure(api_key=os.getenv('Gemini_Api_Key'))
model = genai.GenerativeModel('gemini-1.5-flash')

# Blockchain Connection
INFURA_URL = "https://rpc.open-campus-codex.gelato.digital/"  # Replace with Infura URL
CONTRACT_ADDRESS = "0xd652eDaB0d06B8d45db78743b46c078b53da6070"
PRIVATE_KEY = "YOUR_WALLET_PRIVATE_KEY"  # Store in env for security
WALLET_ADDRESS = "0x6B83EDa0d1A8f38b168386eB422008C03791fa6B"

web3 = Web3(Web3.HTTPProvider(INFURA_URL))

# Smart Contract ABI
CONTRACT_ABI = [
    {"inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "getStreak", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getRewardBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}
]

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)


# Function to process uploaded images or PDFs
def process_uploaded_file(uploaded_file):
    if uploaded_file.mimetype == "application/pdf":
        with tempfile.TemporaryDirectory() as temp_folder:
            images = []
            pdf_document = fitz.open(stream=uploaded_file.read(), filetype="pdf")
            for page_number in range(pdf_document.page_count):
                page = pdf_document.load_page(page_number)
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                images.append(img)

            image = images[0]  # Process the first page as image
            with io.BytesIO() as output:
                image.save(output, format="JPEG")
                return output.getvalue()
    else:
        return uploaded_file.read()


# Function to send prompt and image to Gemini AI
def get_ai_response(prompt, image_data):
    try:
        image = Image.open(io.BytesIO(image_data))
        response = model.generate_content([prompt, image])
        return response.text
    except Exception as e:
        return f"Error processing image: {e}"


# Route to handle image/PDF upload and AI processing
@app.route("/process", methods=["POST"])
def process():
    uploaded_file = request.files.get("file")
    prompt = request.form.get("prompt")

    if not uploaded_file or not prompt:
        return jsonify({"error": "File and prompt are required"}), 400

    image_data = process_uploaded_file(uploaded_file)

    # Simulate processing delay
    time.sleep(15)

    response_text = get_ai_response(prompt, image_data)

    return jsonify({"response": response_text})


# Route to claim blockchain rewards
@app.route('/claim', methods=['POST'])
def claim_reward():
    user_wallet = request.json.get('wallet')  # Ensure wallet is sent from frontend

    if not user_wallet:
        return jsonify({"error": "User wallet address is required"}), 400

    try:
        # Check current reward balance
        balance = contract.functions.getRewardBalance(user_wallet).call()

        if balance == 0:
            return jsonify({"message": "No reward to claim."}), 200

        # Call the claimReward function
        tx_hash = contract.functions.claimReward().transact({"from": user_wallet})
        web3.eth.wait_for_transaction_receipt(tx_hash)

        return jsonify({"message": "Reward claimed successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Route to get user streak
@app.route("/streak", methods=["GET"])
def get_streak():
    user_wallet = request.args.get("wallet")
    streak = contract.functions.getStreak().call({"from": user_wallet})
    return jsonify({"streak": streak})


# Route to get user reward balance
from web3 import Web3

@app.route('/reward_balance', methods=['GET'])
def get_reward_balance():
    user_wallet = request.args.get('wallet')

    if not user_wallet:
        return jsonify({"error": "User wallet address is required"}), 400

    try:
        # Convert to checksum address
        checksum_address = Web3.to_checksum_address(user_wallet)
        print(f"Checksum wallet address: {checksum_address}")

        balance = contract.functions.getRewardBalance().call({"from": checksum_address})
        return jsonify({"balance": balance})
    except Exception as e:
        print(f"Error fetching balance: {str(e)}")  # Log error
        return jsonify({"error": str(e)}), 500





# Home route
@app.route("/")
def index():
    return render_template("land.html")


if __name__ == "__main__":
    app.run(debug=True)
