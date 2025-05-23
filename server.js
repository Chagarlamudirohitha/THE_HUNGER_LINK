import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],  // Match the same origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],  // Allow specific frontend ports
  credentials: true
}));
app.use(express.json());

// Data files paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DONATIONS_FILE = path.join(DATA_DIR, 'donations.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
const initializeDataFile = (filePath, initialData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
  }
};

initializeDataFile(USERS_FILE, { users: [] });
initializeDataFile(DONATIONS_FILE, { donations: [] });
initializeDataFile(MESSAGES_FILE, { messages: [] });
initializeDataFile(NOTIFICATIONS_FILE, { notifications: [] });
initializeDataFile(CHATS_FILE, { chats: [] });

// Auth routes - Place these before other routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(data);
    
    const user = users.find(u => u.email === email);
    console.log('Found user:', user);
    
    if (!user || user.password !== password) {
      console.log('Invalid credentials');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login successful:', userWithoutPassword);
    res.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during login' 
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Initialize users.json if it doesn't exist
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
    }

    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(data);
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'username', 'role', 'phone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if email exists
    if (users.some(u => u.email === req.body.email)) {
      console.log('Email already exists:', req.body.email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Create new user with proper structure
    const newUser = {
      id: `user${Date.now()}`,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      username: req.body.username,
      organizationName: req.body.role === 'ngo' ? req.body.organizationName : undefined,
      phone: req.body.phone,
      address: {
        street: req.body.address?.street || '',
        city: req.body.address?.city || '',
        state: req.body.address?.state || '',
        pincode: req.body.address?.pincode || '',
        country: req.body.address?.country || 'India'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Additional validation for NGO registration
    if (newUser.role === 'ngo' && !newUser.organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required for NGO registration'
      });
    }
    
    console.log('Creating new user:', newUser);
    
    // Add new user to array
    users.push(newUser);
    
    // Write updated users array back to file
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
    console.log('User saved successfully');
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during registration: ' + (error.message || 'Unknown error')
    });
  }
});

app.get('/api/users/check-email/:email', (req, res) => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(data);
    
    const exists = users.some(u => u.email === req.params.email);
    res.json({ exists });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Error checking email' });
  }
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New socket connection');
  const { userId } = socket.handshake.query;
  
  if (userId) {
    console.log('User connected:', userId);
    connectedUsers.set(userId, socket.id);
    
    // Join user's room for private messages
    socket.join(`user_${userId}`);

    // Send connection acknowledgment
    socket.emit('connected', { userId });
  }

  // Handle chat messages
  socket.on('message', async (data) => {
    try {
      const { chatId, content, senderId, senderName, receiverId } = data;
      console.log('New message:', { chatId, senderId, receiverId, content });

      if (!chatId || !content || !senderId || !receiverId) {
        console.error('Invalid message data:', data);
        return;
      }

      // Save message to chat
      const chatsData = fs.readFileSync(CHATS_FILE, 'utf-8');
      const { chats } = JSON.parse(chatsData);
      const chatIndex = chats.findIndex(c => c.id === chatId);

      if (chatIndex === -1) {
        console.error('Chat not found:', chatId);
        return;
      }

      const newMessage = {
        id: `msg_${Date.now()}`,
        content,
        senderId,
        senderName,
        receiverId,
        createdAt: new Date().toISOString(),
        isRead: false,
        chatId
      };

      // Initialize messages array if needed
      if (!chats[chatIndex].messages) {
        chats[chatIndex].messages = [];
      }

      // Check for duplicate message (within last 5 seconds)
      const isDuplicate = chats[chatIndex].messages.some(msg => {
        const timeDiff = Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime());
        return msg.content === content && 
               msg.senderId === senderId && 
               msg.receiverId === receiverId && 
               timeDiff < 5000; // 5 seconds
      });

      if (isDuplicate) {
        console.log('Duplicate message detected, skipping');
        return;
      }

      chats[chatIndex].messages.push(newMessage);
      chats[chatIndex].lastMessage = newMessage;
      chats[chatIndex].updatedAt = new Date().toISOString();

      fs.writeFileSync(CHATS_FILE, JSON.stringify({ chats }, null, 2));

      // Send real-time message to recipient
      const recipientSocketId = connectedUsers.get(receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message', {
          chatId,
          message: newMessage
        });
      }

      // Send acknowledgment to sender
      socket.emit('messageSent', {
        chatId,
        message: newMessage
      });
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle read receipts
  socket.on('markAsRead', async (data) => {
    try {
      const { chatId, userId } = data;
      console.log('Marking messages as read:', { chatId, userId });

      const chatsData = fs.readFileSync(CHATS_FILE, 'utf-8');
      const { chats } = JSON.parse(chatsData);
      const chatIndex = chats.findIndex(c => c.id === chatId);

      if (chatIndex !== -1) {
        let updated = false;
        chats[chatIndex].messages = chats[chatIndex].messages.map(msg => {
          if (msg.receiverId === userId && !msg.isRead) {
            updated = true;
            return { ...msg, isRead: true };
          }
          return msg;
        });

        if (updated) {
          fs.writeFileSync(CHATS_FILE, JSON.stringify({ chats }, null, 2));

          // Update messages.json
          const messagesData = fs.readFileSync(MESSAGES_FILE, 'utf-8');
          const { messages } = JSON.parse(messagesData);
          const updatedMessages = messages.map(msg => {
            if (msg.chatId === chatId && msg.receiverId === userId && !msg.isRead) {
              return { ...msg, isRead: true };
            }
            return msg;
          });
          fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages: updatedMessages }, null, 2));

          // Notify sender about read messages
          const lastMessage = chats[chatIndex].lastMessage;
          if (lastMessage && lastMessage.senderId) {
            const senderSocketId = connectedUsers.get(lastMessage.senderId);
            if (senderSocketId) {
              io.to(senderSocketId).emit('messagesRead', { chatId, userId });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    if (userId) {
      console.log('User disconnected:', userId);
      connectedUsers.delete(userId);
      socket.leave(`user_${userId}`);
    }
  });
});

// User routes
app.get('/api/users', (req, res) => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Error reading users' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(data);
    users.push(req.body);
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Error saving user' });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(data);
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
      users[index] = req.body;
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
      res.json(req.body);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Add this function after the data file paths
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

const MAX_DISTANCE = 50; // Maximum distance in kilometers for NGO matching

// Helper function to check if two locations are in proximity
function areLocationsInProximity(location1, location2) {
  // First check if city matches
  if (location1.city.toLowerCase() !== location2.city.toLowerCase()) {
    return false;
  }
  
  // Check if last 3 digits of pincode are within range
  const lastThree1 = location1.pincode.slice(-3);
  const lastThree2 = location2.pincode.slice(-3);
  
  if (!lastThree1 || !lastThree2) {
    return true; // If either pincode is invalid, just use city match
  }
  
  return Math.abs(parseInt(lastThree1) - parseInt(lastThree2)) <= 3;
}

// Donation routes
app.get('/api/donations', (req, res) => {
  try {
    const data = fs.readFileSync(DONATIONS_FILE, 'utf-8');
    const { donations } = JSON.parse(data);
    
    // If NGO ID is provided in query params, filter by location
    const { ngoId } = req.query;
    if (ngoId) {
      const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
      const { users } = JSON.parse(usersData);
      const ngo = users.find(u => u.id === ngoId);
      
      if (ngo) {
        const availableDonations = donations.filter(d => {
          // Only show pending donations
          if (d.status !== 'pending') return false;
          // Check if donation is in NGO's area
          return areLocationsInProximity(d.location, ngo.address);
        });
        return res.json(availableDonations);
      }
    }
    
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'Error reading donations' });
  }
});

app.post('/api/donations', (req, res) => {
  try {
    const data = fs.readFileSync(DONATIONS_FILE, 'utf-8');
    const { donations } = JSON.parse(data);
    
    // Create new donation with proper structure
    const newDonation = {
      id: `donation${Date.now()}`,
      donorId: req.body.donorId,
      donorName: req.body.donorName,
      foodType: req.body.foodType,
      servings: req.body.servings,
      pickupTime: req.body.pickupTime,
      expiryDate: req.body.expiryDate,
      notes: req.body.notes,
      location: {
        street: req.body.location.street,
        city: req.body.location.city,
        state: req.body.location.state,
        pincode: req.body.location.pincode,
        country: req.body.location.country
      },
      status: 'pending',
      ngoId: null,
      ngoName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    donations.push(newDonation);
    fs.writeFileSync(DONATIONS_FILE, JSON.stringify({ donations }, null, 2));

    // Find and notify nearby NGOs
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(usersData);
    const nearbyNGOs = users.filter(user => {
      if (user.role !== 'ngo') return false;
      return areLocationsInProximity(newDonation.location, user.address);
    });

    // Create notifications for nearby NGOs
    const notificationsData = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    const { notifications } = JSON.parse(notificationsData);

    nearbyNGOs.forEach(ngo => {
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: ngo.id,
        type: 'new_donation',
        title: 'New Donation Available',
        message: `New food donation available near you in ${newDonation.location.city}`,
        donationId: newDonation.id,
        createdAt: new Date().toISOString(),
        read: false
      };
      notifications.push(notification);

      // Send real-time notification if NGO is online
      const ngoSocketId = connectedUsers.get(ngo.id);
      if (ngoSocketId) {
        io.to(ngoSocketId).emit('notification', notification);
      }
    });

    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify({ notifications }, null, 2));
    res.json(newDonation);
  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({ error: 'Error saving donation' });
  }
});

app.put('/api/donations/:id', (req, res) => {
  try {
    const data = fs.readFileSync(DONATIONS_FILE, 'utf-8');
    const { donations } = JSON.parse(data);
    const donationIndex = donations.findIndex(d => d.id === req.params.id);
    
    if (donationIndex === -1) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    const oldDonation = donations[donationIndex];
    const updatedDonation = {
      ...oldDonation,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // Check location proximity if NGO is accepting the donation
    if (req.body.status === 'accepted' && req.body.ngoId) {
      // Get NGO data
      const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
      const { users } = JSON.parse(usersData);
      const ngo = users.find(u => u.id === req.body.ngoId);
      
      if (!ngo) {
        return res.status(400).json({ error: 'NGO not found' });
      }
      
      if (!areLocationsInProximity(oldDonation.location, ngo.address)) {
        return res.status(400).json({ 
          error: 'Cannot accept donation: Location is too far or not in the same region' 
        });
      }
      
      // Update donation with NGO information
      updatedDonation.ngoId = ngo.id;
      updatedDonation.ngoName = ngo.organizationName;
      
      // Create a chat between donor and NGO
      const chatsData = fs.readFileSync(CHATS_FILE, 'utf-8');
      const { chats } = JSON.parse(chatsData);
      
      const newChat = {
        id: `chat_${Date.now()}`,
        donationId: oldDonation.id,
        participantIds: [oldDonation.donorId, ngo.id],
        messages: [],
        lastMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      chats.push(newChat);
      fs.writeFileSync(CHATS_FILE, JSON.stringify({ chats }, null, 2));
      
      // Notify both donor and NGO about the new chat
      const donorSocketId = connectedUsers.get(oldDonation.donorId);
      const ngoSocketId = connectedUsers.get(ngo.id);
      
      if (donorSocketId) {
        io.to(donorSocketId).emit('newChat', newChat);
      }
      if (ngoSocketId) {
        io.to(ngoSocketId).emit('newChat', newChat);
      }
      
      // Create notification for donor
      const notificationsData = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      const { notifications } = JSON.parse(notificationsData);
      
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: oldDonation.donorId,
        type: 'donation_accepted',
        title: 'Donation Accepted',
        message: `Your donation has been accepted by ${ngo.organizationName}. You can now chat with them.`,
        donationId: oldDonation.id,
        chatId: newChat.id,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      notifications.push(notification);
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify({ notifications }, null, 2));
      
      // Send real-time notification if donor is online
      if (donorSocketId) {
        io.to(donorSocketId).emit('notification', notification);
      }
    }
    
    // Update the donation in the array
    donations[donationIndex] = updatedDonation;
    
    // Save the updated donations array back to the file
    fs.writeFileSync(DONATIONS_FILE, JSON.stringify({ donations }, null, 2));
    
    res.json(updatedDonation);
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ error: 'Error updating donation' });
  }
});

app.get('/api/donations/donor/:donorId', (req, res) => {
  try {
    const data = fs.readFileSync(DONATIONS_FILE, 'utf-8');
    const { donations } = JSON.parse(data);
    
    // Get donor's data to check location
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(usersData);
    const donor = users.find(u => u.id === req.params.donorId);
    
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Filter donations by donor ID and location
    const donorDonations = donations.filter(d => {
      // If it's the donor's own donation, include it
      if (d.donorId === req.params.donorId) {
        return true;
      }
      
      // For other donations, check if they're in the same area
      return areLocationsInProximity(d.location, donor.address);
    });
    
    res.json(donorDonations);
  } catch (error) {
    res.status(500).json({ error: 'Error reading donor donations' });
  }
});

app.get('/api/donations/ngo/:ngoId', (req, res) => {
  try {
    const data = fs.readFileSync(DONATIONS_FILE, 'utf-8');
    const { donations } = JSON.parse(data);
    const ngoDonations = donations.filter(d => d.ngoId === req.params.ngoId);
    res.json(ngoDonations);
  } catch (error) {
    res.status(500).json({ error: 'Error reading NGO donations' });
  }
});

// Message routes
app.get('/api/messages/:userId', (req, res) => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const { messages } = JSON.parse(data);
    const userMessages = messages.filter(
      m => m.senderId === req.params.userId || m.recipientId === req.params.userId
    );
    res.json(userMessages);
  } catch (error) {
    res.status(500).json({ error: 'Error reading messages' });
  }
});

app.post('/api/messages', (req, res) => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const { messages } = JSON.parse(data);
    const newMessage = {
      id: Date.now().toString(),
      ...req.body,
      read: false,
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages }, null, 2));

    // Notify recipient through socket if online
    const recipientSocketId = connectedUsers.get(newMessage.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message', newMessage);
    }

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error saving message' });
  }
});

app.put('/api/messages/:messageId/read', (req, res) => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const { messages } = JSON.parse(data);
    const messageIndex = messages.findIndex(m => m.id === req.params.messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    messages[messageIndex].read = true;
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages }, null, 2));
    res.json(messages[messageIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating message' });
  }
});

// Get unread message count for a user
app.get('/api/messages/:userId/unread', (req, res) => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const { messages } = JSON.parse(data);
    const unreadCount = messages.filter(
      m => m.recipientId === req.params.userId && !m.read
    ).length;
    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Error counting unread messages' });
  }
});

// Get chat history between two users
app.get('/api/messages/:userId/:otherUserId', (req, res) => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const { messages } = JSON.parse(data);
    const chatHistory = messages.filter(
      m => (m.senderId === req.params.userId && m.recipientId === req.params.otherUserId) ||
           (m.senderId === req.params.otherUserId && m.recipientId === req.params.userId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

// Notification routes
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    const { notifications } = JSON.parse(data);
    const userNotifications = notifications
      .filter(n => n.userId === req.params.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(userNotifications);
  } catch (error) {
    res.status(500).json({ error: 'Error reading notifications' });
  }
});

app.post('/api/notifications', (req, res) => {
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    const { notifications } = JSON.parse(data);
    const newNotification = {
      id: Date.now().toString(),
      ...req.body,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify({ notifications }, null, 2));

    // Send real-time notification if user is online
    const userSocketId = connectedUsers.get(newNotification.userId);
    if (userSocketId) {
      io.to(userSocketId).emit('notification', newNotification);
    }

    res.json(newNotification);
  } catch (error) {
    res.status(500).json({ error: 'Error saving notification' });
  }
});

app.put('/api/notifications/:notificationId/read', (req, res) => {
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    const { notifications } = JSON.parse(data);
    const notificationIndex = notifications.findIndex(n => n.id === req.params.notificationId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notifications[notificationIndex].read = true;
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify({ notifications }, null, 2));
    res.json(notifications[notificationIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating notification' });
  }
});

app.get('/api/notifications/:userId/unread', (req, res) => {
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    const { notifications } = JSON.parse(data);
    const unreadCount = notifications.filter(
      n => n.userId === req.params.userId && !n.read
    ).length;
    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Error counting unread notifications' });
  }
});

// Chat endpoints
app.get('/api/chats/:userId', (req, res) => {
  try {
    const data = fs.readFileSync(CHATS_FILE, 'utf-8');
    const { chats } = JSON.parse(data);
    const userChats = chats.filter(chat => 
      chat.participantIds.includes(req.params.userId)
    );

    // Fetch user details for participants
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(usersData);

    // Add participant details to each chat
    const enrichedChats = userChats.map(chat => {
      const participants = chat.participantIds.map(participantId => {
        const user = users.find(u => u.id === participantId);
        return user ? {
          id: user.id,
          username: user.username,
          organizationName: user.organizationName,
          role: user.role
        } : null;
      }).filter(Boolean);

      return {
        ...chat,
        participants
      };
    });

    res.json(enrichedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Error fetching chats' });
  }
});

app.get('/api/chats/by-donation/:donationId', (req, res) => {
  try {
    const data = fs.readFileSync(CHATS_FILE, 'utf-8');
    const { chats } = JSON.parse(data);
    const chat = chats.find(c => c.donationId === req.params.donationId);
    
    if (!chat) {
      // Create a new chat if donation exists
      const donationsData = fs.readFileSync(DONATIONS_FILE, 'utf-8');
      const { donations } = JSON.parse(donationsData);
      const donation = donations.find(d => d.id === req.params.donationId);
      
      if (!donation || !donation.ngoId) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Check if a chat with these participants already exists
      const existingChat = chats.find(c => 
        c.donationId === donation.id && 
        c.participantIds.includes(donation.donorId) && 
        c.participantIds.includes(donation.ngoId)
      );

      if (existingChat) {
        return res.json(existingChat);
      }

      // Create new chat with proper ID format
      const newChat = {
        id: `chat_${Date.now()}`,
        donationId: donation.id,
        participantIds: [donation.donorId, donation.ngoId],
        messages: [],
        lastMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      chats.push(newChat);
      fs.writeFileSync(CHATS_FILE, JSON.stringify({ chats }, null, 2));

      // Fetch user details for participants
      const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
      const { users } = JSON.parse(usersData);
      const participants = newChat.participantIds.map(participantId => {
        const user = users.find(u => u.id === participantId);
        return user ? {
          id: user.id,
          username: user.username,
          organizationName: user.organizationName,
          role: user.role
        } : null;
      }).filter(Boolean);

      return res.json({
        ...newChat,
        participants
      });
    }
    
    // Add participant details to existing chat
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(usersData);
    const participants = chat.participantIds.map(participantId => {
      const user = users.find(u => u.id === participantId);
      return user ? {
        id: user.id,
        username: user.username,
        organizationName: user.organizationName,
        role: user.role
      } : null;
    }).filter(Boolean);

    res.json({
      ...chat,
      participants
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Error fetching chat' });
  }
});

app.post('/api/chats', (req, res) => {
  try {
    const data = fs.readFileSync(CHATS_FILE, 'utf-8');
    const { chats } = JSON.parse(data);
    
    // Check if chat already exists for this donation and participants
    const existingChat = chats.find(c => 
      c.donationId === req.body.donationId && 
      c.participantIds.every(id => req.body.participantIds.includes(id)) &&
      c.participantIds.length === req.body.participantIds.length
    );

    if (existingChat) {
      return res.json(existingChat);
    }
    
    const newChat = {
      id: `chat_${Date.now()}`,
      participantIds: req.body.participantIds || [],
      donationId: req.body.donationId,
      messages: [],
      lastMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    chats.push(newChat);
    fs.writeFileSync(CHATS_FILE, JSON.stringify({ chats }, null, 2));
    
    // Notify participants about new chat
    if (newChat.participantIds) {
      newChat.participantIds.forEach(userId => {
        const userSocketId = connectedUsers.get(userId);
        if (userSocketId) {
          io.to(userSocketId).emit('newChat', newChat);
        }
      });
    }
    
    res.json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Error creating chat' });
  }
});

app.post('/api/chats/:chatId/messages', (req, res) => {
  try {
    const data = fs.readFileSync(CHATS_FILE, 'utf-8');
    const { chats } = JSON.parse(data);
    const chatIndex = chats.findIndex(c => c.id === req.params.chatId);
    
    if (chatIndex === -1) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      content: req.body.content,
      senderId: req.body.senderId,
      senderName: req.body.senderName,
      receiverId: req.body.receiverId,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Initialize messages array if it doesn't exist
    if (!chats[chatIndex].messages) {
      chats[chatIndex].messages = [];
    }
    
    chats[chatIndex].messages.push(newMessage);
    chats[chatIndex].lastMessage = newMessage;
    chats[chatIndex].updatedAt = new Date().toISOString();
    
    fs.writeFileSync(CHATS_FILE, JSON.stringify({ chats }, null, 2));

    // Also save message to messages.json
    const messagesData = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const { messages } = JSON.parse(messagesData);
    messages.push({
      ...newMessage,
      chatId: req.params.chatId
    });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages }, null, 2));
    
    // Send real-time message if recipient is online
    const recipientSocketId = connectedUsers.get(newMessage.receiverId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message', {
        chatId: req.params.chatId,
        message: newMessage
      });
    }
    
    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

app.put('/api/chats/:chatId/messages/read', (req, res) => {
  try {
    const { userId } = req.body;
    const chatId = req.params.chatId;

    if (!userId || !chatId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const data = fs.readFileSync(CHATS_FILE, 'utf-8');
    const { chats } = JSON.parse(data);
    const chatIndex = chats.findIndex(c => c.id === chatId);
    
    if (chatIndex === -1) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    let updated = false;
    chats[chatIndex].messages = chats[chatIndex].messages.map(msg => {
      if (msg.receiverId === userId && !msg.isRead) {
        updated = true;
        return { ...msg, isRead: true };
      }
      return msg;
    });
    
    if (updated) {
      fs.writeFileSync(CHATS_FILE, JSON.stringify({ chats }, null, 2));

      // Notify sender about read messages
      const lastMessage = chats[chatIndex].lastMessage;
      if (lastMessage && lastMessage.senderId) {
        const senderSocketId = connectedUsers.get(lastMessage.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesRead', { chatId, userId });
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Error marking messages as read' });
  }
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    // Read donations data
    const donationsData = fs.readFileSync(DONATIONS_FILE, 'utf-8');
    const { donations } = JSON.parse(donationsData);
    
    // Read users data
    const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
    const { users } = JSON.parse(usersData);
    
    // Calculate stats
    const stats = {
      totalDonations: donations.length,
      totalServings: donations.reduce((total, d) => total + (d.servings || 0), 0),
      totalPeopleFed: donations.filter(d => d.status === 'completed')
        .reduce((total, d) => total + (d.servings || 0), 0),
      totalNGOs: users.filter(u => u.role === 'ngo').length,
      activeDonations: donations.filter(d => d.status === 'pending' || d.status === 'accepted').length,
      completedDonations: donations.filter(d => d.status === 'completed').length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error calculating stats' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 