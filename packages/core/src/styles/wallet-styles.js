// Defines CSS styles for web components
const styles = `

body {
    font-family: 'Arial', sans-serif;
    background-color: #f4f4f9;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
}

.wallet-card {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 20px;
    transition: all 0.3s ease;
}

.wallet-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.wallet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.wallet-logo {
    height: 50px;
    width: 50px;
    margin-right: 15px;
    flex-shrink: 0;
}

.wallet-balance {
    font-size: 22px;
    font-weight: bold;
    color: #333;
    margin: 0;
    display: flex;
    align-items: center;
}

.wallet-balance-text {
    margin-left: 5px;
    font-size: 16px;
    color: #777;
}

.change-positive {
    color: #4caf50;
}

.change-negative {
    color: #f44336;
}
`;

export default styles;

