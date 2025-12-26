/*const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'public', 'uploads', 'menu');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `menu-${uniqueName}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    },
});

module.exports = upload;*/
/*finaly change this
// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, '..', 'public', 'uploads', folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const prefix = folder === 'avatars' ? 'avatar' : 'menu';
            cb(null, `${prefix}-${uniqueName}${path.extname(file.originalname)}`);
        },
    });
};

const uploadAvatar = multer({
    storage: createStorage('avatars'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

const uploadMenu = multer({
    storage: createStorage('menu'),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

module.exports = { uploadAvatar, uploadMenu };*/

/*// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// const createStorage = (folder) => {
//     return multer.diskStorage({
//         destination: (req, file, cb) => {
//             const dir = path.join(__dirname, '..', 'public', 'uploads', folder);
//             if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//             cb(null, dir);
//         },
//         filename: (req, file, cb) => {
//             const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
//             const prefix = folder === 'avatars' ? 'avatar' : folder === 'menu' ? 'menu' : 'room';
//             cb(null, `${prefix}-${uniqueName}${path.extname(file.originalname)}`);
//         },
//     });
// };
const createStorage = (folder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            // This is correct for saving
            const dir = path.join(__dirname, '..', 'public', 'uploads', folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            // This just sets the filename, which is what we want
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const prefix = folder === 'avatars' ? 'avatar' : folder === 'menu' ? 'menu' : 'room';
            cb(null, `${prefix}-${uniqueName}${path.extname(file.originalname)}`);
        },
    });
};
const uploadAvatar = multer({
    storage: createStorage('avatars'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

const uploadMenu = multer({
    storage: createStorage('menu'),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

const uploadRoom = multer({
    storage: createStorage('rooms'),
    limits: { fileSize: 10 * 1024 * 1024, files: 3 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

const uploadChatFile = multer({
    storage: createStorage('chat'),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
        cb(null, true); // Allow all file types for now
    }
});

// 5. News/Announcement Upload
const uploadNews = multer({
    storage: createStorage('news'),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
    fileFilter: (req, file, cb) => {
        // Regex to check for media types
        const isMedia = /^(image|video|audio)\//.test(file.mimetype);

        // Exact match for document types
        const isDocument = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ].includes(file.mimetype);

        if (isMedia || isDocument) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Please upload images, videos, audio, or documents only.'));
        }
    }
});
// 6. Logo Upload (NEW)
const uploadLogo = multer({
    storage: createStorage('logo'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files allowed for logo'));
    }
});

module.exports = { uploadAvatar, uploadMenu, uploadRoom, uploadChatFile, uploadNews, uploadLogo };
module.exports = { uploadAvatar, uploadMenu, uploadRoom, uploadChatFile, uploadNews, uploadLogo };*/ // backend/src/middleware/upload.js
/*const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const createStorage = (folder) => {
//     return multer.diskStorage({
//         destination: (req, file, cb) => {
//             const dir = path.join(__dirname, '..', 'public', 'uploads', folder);
//             if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//             cb(null, dir);
//         },
//         filename: (req, file, cb) => {
//             const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
//             const prefix = folder === 'avatars' ? 'avatar' : folder === 'menu' ? 'menu' : 'room';
//             cb(null, `${prefix}-${uniqueName}${path.extname(file.originalname)}`);
//         },
//     });
// };
const createStorage = (folder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            // This is correct for saving
            const dir = path.join(__dirname, '..', 'public', 'uploads', folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            // This just sets the filename, which is what we want
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const prefix = folder === 'avatars' ? 'avatar' : folder === 'menu' ? 'menu' : 'room';
            cb(null, `${prefix}-${uniqueName}${path.extname(file.originalname)}`);
        },
    });
};
// Configuration (Add these to your Render Env Variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup storage for Avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avatars',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});
const uploadAvatar = multer({ storage: avatarStorage });

// Keep your other uploaders but switch them to Cloudinary folders too
const menuStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'menu' }
});
const uploadMenu = multer({ storage: menuStorage });
// const uploadAvatar = multer({
//     storage: createStorage('avatars'),
//     limits: { fileSize: 5 * 1024 * 1024 },
//     fileFilter: (req, file, cb) => {
//         const allowed = /jpeg|jpg|png|webp|gif/;
//         const ext = path.extname(file.originalname).toLowerCase();
//         if (allowed.test(ext)) cb(null, true);
//         else cb(new Error('Only image files allowed'));
//     }
// });

// const uploadMenu = multer({
//     storage: createStorage('menu'),
//     limits: { fileSize: 10 * 1024 * 1024 },
//     fileFilter: (req, file, cb) => {
//         const allowed = /jpeg|jpg|png|webp|gif/;
//         const ext = path.extname(file.originalname).toLowerCase();
//         if (allowed.test(ext)) cb(null, true);
//         else cb(new Error('Only image files allowed'));
//     }
// });

const uploadRoom = multer({
    storage: createStorage('rooms'),
    limits: { fileSize: 10 * 1024 * 1024, files: 3 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

const uploadChatFile = multer({
    storage: createStorage('chat'),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
        cb(null, true); // Allow all file types for now
    }
});

// 5. News/Announcement Upload
const uploadNews = multer({
    storage: createStorage('news'),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
    fileFilter: (req, file, cb) => {
        // Regex to check for media types
        const isMedia = /^(image|video|audio)\//.test(file.mimetype);

        // Exact match for document types
        const isDocument = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ].includes(file.mimetype);

        if (isMedia || isDocument) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Please upload images, videos, audio, or documents only.'));
        }
    }
});
// 6. Logo Upload (NEW)
const uploadLogo = multer({
    storage: createStorage('logo'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files allowed for logo'));
    }
});

module.exports = { uploadAvatar, uploadMenu, uploadRoom, uploadChatFile, uploadNews, uploadLogo };*/ // backend/src/middleware/upload.js

// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const createCloudinaryStorage = (folderName) => new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: folderName,
//         resource_type: 'auto', // Important: Allows images, video, and pdf
//         allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'pdf', 'mp4', 'mp3'],
//     }
// });

// const uploadAvatar = multer({ storage: createCloudinaryStorage('avatars') });
// const uploadMenu = multer({ storage: createCloudinaryStorage('menu') });
// const uploadRoom = multer({ storage: createCloudinaryStorage('rooms') });
// const uploadNews = multer({ storage: createCloudinaryStorage('news') });
// const uploadChatFile = multer({ storage: createCloudinaryStorage('chat') });
// const uploadLogo = multer({ storage: createCloudinaryStorage('logo') });

// module.exports = { uploadAvatar, uploadMenu, uploadRoom, uploadNews, uploadChatFile, uploadLogo };

/*// backend/src/middleware/upload.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createCloudinaryStorage = (folderName) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: folderName,
        resource_type: 'auto', // Detects if it is image or video automatically
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'pdf', 'mp4', 'mp3'],
    }
});
const createStorage = (folder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            // This is correct for saving
            const dir = path.join(__dirname, '..', 'public', 'uploads', folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            // This just sets the filename, which is what we want
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const prefix = folder === 'avatars' ? 'avatar' : folder === 'menu' ? 'menu' : 'room';
            cb(null, `${prefix}-${uniqueName}${path.extname(file.originalname)}`);
        },
    });
};
const uploadAvatar = multer({ storage: createCloudinaryStorage('avatars') });
const uploadMenu = multer({ storage: createCloudinaryStorage('menu') });
// const uploadRoom = multer({ storage: createCloudinaryStorage('rooms') });
const uploadRoom = multer({
    storage: createStorage('rooms'),
    limits: { fileSize: 10 * 1024 * 1024, files: 3 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});
const uploadNews = multer({ storage: createCloudinaryStorage('news') });
const uploadChatFile = multer({ storage: createCloudinaryStorage('chat') });
const uploadLogo = multer({ storage: createCloudinaryStorage('logo') });

module.exports = { uploadAvatar, uploadMenu, uploadRoom, uploadNews, uploadChatFile, uploadLogo };*/
// backend/src/middleware/upload.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createCloudinaryStorage = (folderName) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: folderName,
        resource_type: 'auto', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'pdf', 'mp4', 'mp3'],
    }
});

// ✅ FIXED: All uploaders now use Cloudinary
const uploadAvatar = multer({ storage: createCloudinaryStorage('avatars') });
const uploadMenu = multer({ storage: createCloudinaryStorage('menu') });
const uploadRoom = multer({ storage: createCloudinaryStorage('rooms') }); // Fixed this line
const uploadNews = multer({ storage: createCloudinaryStorage('news') });
const uploadChatFile = multer({ storage: createCloudinaryStorage('chat') });
const uploadLogo = multer({ storage: createCloudinaryStorage('logo') });

module.exports = { uploadAvatar, uploadMenu, uploadRoom, uploadNews, uploadChatFile, uploadLogo };