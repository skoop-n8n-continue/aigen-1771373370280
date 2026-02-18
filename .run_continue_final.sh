#!/bin/bash
cd "/home/node/n8n-continue/aigen-1771373370280"

# Run Continue CLI in headless mode (only outputs final response)
cn -p "User Prompt:
Create a premium, calming video for our dispensary menu board. We want a zen garden aesthetic with soft flowing water elements and gentle animations. Think luxury spa meets modern dispensary. Use earth tones - sage green, warm beige, and soft gold accents. Products should slide in smoothly like they're floating down a river or something unique and creative. Keep it classy and medical-focused. 

create and use this sample products.json file: 
\`\`\`
{
    \"products\": [
      {
        \"id\": \"4575638\",
        \"name\": \"Money Saki 1g Preroll\",
        \"category\": \"Distillate Cartridge\",
        \"vendor\": \"Hansen Pharms\",
        \"price\": \"2.5\",
        \"image_url\": \"https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fmkx_cartridge_box-1770340372957.png\",
        \"discounted_price\": 0,
        \"description\": \"\",
        \"quantityAvailable\": 4,
        \"quantityUnits\": \"Quantity\",
        \"unitWeight\": 0.5,
        \"flowerEquivalentUnits\": \"g\",
        \"strainType\": \"Sativa\",
        \"labResults\": [
          {
            \"labTest\": \"THC\",
            \"value\": 75.09,
            \"labResultUnitId\": 2,
            \"labResultUnit\": \"Percentage\"
          }
        ]
      },
      {
        \"id\": \"4575639\",
        \"name\": \"DIME Disposable 0.9g | Blueberry Lemon Haze\",
        \"category\": \"All-In-One Vape\",
        \"vendor\": \"Hansen Pharms\",
        \"price\": \"3.5\",
        \"image_url\": \"https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Flegit_labs_box-1770340400372.png\",
        \"discounted_price\": 2.5,
        \"strainType\": \"Sativa\",
        \"labResults\": [
          {
            \"labTest\": \"THC\",
            \"value\": 82.3,
            \"labResultUnitId\": 2,
            \"labResultUnit\": \"Percentage\"
          }
        ]
      },
      {
        \"id\": \"4575640\",
        \"name\": \"Blueberry Muffin Live Rosin Cartridge | 0.5g\",
        \"category\": \"Rosin Cartridge\",
        \"vendor\": \"Hansen Pharms\",
        \"price\": \"4.0\",
        \"image_url\": \"https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fmkx_disposable_cyan-1770340426216.png\",
        \"discounted_price\": 0,
        \"strainType\": \"Hybrid\",
        \"labResults\": [
          {
            \"labTest\": \"THC\",
            \"value\": 68.5,
            \"labResultUnitId\": 2,
            \"labResultUnit\": \"Percentage\"
          }
        ]
      },
      {
        \"id\": \"4575641\",
        \"name\": \"Purple Punch Live Resin\",
        \"category\": \"Concentrate\",
        \"vendor\": \"Hansen Pharms\",
        \"price\": \"5.0\",
        \"image_url\": \"https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Flegit_labs_box-1770340400372.png\",
        \"discounted_price\": 3.5,
        \"strainType\": \"Indica\",
        \"labResults\": [
          {
            \"labTest\": \"THC\",
            \"value\": 89.2,
            \"labResultUnitId\": 2,
            \"labResultUnit\": \"Percentage\"
          }
        ]
      }
    ]
  }
  \`\`\`


-- End of User Prompt --

You are now in **AGENT MODE**. Time to execute.
Implement **EVERYTHING** requested by the user. 
Create working, professional, production-ready code." --config config.yaml --rule .context_rule.md 2>&1

# Clean up
rm -f .context_rule.md
