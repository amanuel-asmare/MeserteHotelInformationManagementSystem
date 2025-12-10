'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import Message from './Message'; // We'll create this next

// Helper to group messages by date
const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, msg) => {
        const date = format(new Date(msg.createdAt), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(msg);
        return acc;
    }, {});
};

const MessageList = ({ messages, currentUser, loading, onEditMessage, onDeleteMessage }) => {
    const messagesEndRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null); // Managed here for context menu

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    if (loading) {
        return <div className="flex-grow flex items-center justify-center"><p>Loading conversation...</p></div>;
    }

    const groupedMessages = groupMessagesByDate(messages);
    const sortedDates = Object.keys(groupedMessages).sort();

    return (
        <div className="flex-grow p-4 overflow-y-auto bg-gray-100/50 dark:bg-gray-900/50">
            <AnimatePresence>
                {sortedDates.map(date => (
                    <div key={date}>
                        <div className="text-center my-4">
                            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-semibold">
                                {format(new Date(date), 'MMMM d, yyyy')}
                            </span>
                        </div>
                        {groupedMessages[date].map(msg => (
                            <Message
                                key={msg._id}
                                message={msg}
                                isCurrentUser={msg.sender._id === currentUser.id}
                                onEdit={onEditMessage}
                                onDelete={onDeleteMessage}
                                onReply={() => setReplyingTo(msg)} // Pass up to the input
                            />
                        ))}
                    </div>
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;