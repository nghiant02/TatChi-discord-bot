require('dotenv/config');

const keep_alive = require('./keep_alive.js');
const { Client } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});

client.on('ready', () => {
    console.log("The bot is online.");
});

const IGNORE_PREFIX = "!";

const CHANNELS = process.env.CHANNELS.split(', ');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return;
    if (message.mentions.users.size > 0) return;
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;
    
    await message.channel.sendTyping();
    const sendingTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    let conversation = [];

    conversation.push({
        role: 'system',
        content: 'The assistant is friendly, sociable, and knows everything, ready to provide you with any information you need.',
    });

    let prevMessages = await message.channel.messages.fetch({ limit: 10 });
    prevMessages = prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        if (msg.content.startsWith(IGNORE_PREFIX)) return;

        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        conversation.push({
            role: msg.author.id === client.user.id ? 'assistant' : 'user',
            name: username,
            content: msg.content,
        });
    });

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversation,
    }).catch((error) => console.error('OpenAI Error:\n', error));

    clearInterval(sendingTypingInterval);

    if (!response) {
        message.reply("I'm having some trouble with the OpenAI. Try again in a moment.");
        return;
    }

    const responseMessage = response.choices[0].message.content;
    const chunkSizeLimit = 2000;

    for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);
        await message.reply(chunk);
    }
});

client.login(process.env.TOKEN);
