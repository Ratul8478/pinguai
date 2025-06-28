import React from 'react';

interface IconProps {
  className?: string;
}

export const PenguinIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" className={className}>
        <g clipPath="url(#clip0_105_2)">
            <path fill="#27272A" d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" />
            <path fill="#fff" d="M100 181.087C132.062 181.087 158.152 165.652 170.652 142.391C172.481 138.83 173.733 134.981 174.348 130.978C178.696 102.304 159.239 75.4348 130.978 70.8696C130.978 70.8696 142.391 43.1522 100 43.1522C57.6087 43.1522 69.0217 70.8696 69.0217 70.8696C40.7609 75.4348 21.3043 102.304 25.6522 130.978C26.2674 134.981 27.5193 138.83 29.3478 142.391C41.8478 165.652 67.9385 181.087 100 181.087Z" />
            <path fill="#27272A" d="M130.978 70.8696C130.978 70.8696 142.391 43.1522 100 43.1522C57.6087 43.1522 69.0217 70.8696 69.0217 70.8696C40.7609 75.4348 21.3043 102.304 25.6522 130.978C26.0272 133.402 26.8587 135.739 28.087 137.826C29.087 135.913 29.8261 133.826 30.2174 131.652C32.4783 119.565 39.5217 109.239 49.3478 103.043L49.5652 102.826C55.4348 97.8261 62.6522 94.1304 70.3478 92.1739L70.4348 92.087C74.6522 90.8696 79.2174 90.087 83.913 89.8696H116.087C120.783 90.087 125.348 90.8696 129.565 92.087L129.652 92.1739C137.348 94.1304 144.565 97.8261 150.435 102.826L150.652 103.043C160.478 109.239 167.522 119.565 169.783 131.652C170.174 133.826 170.913 135.913 171.913 137.826C173.141 135.739 173.973 133.402 174.348 130.978C178.696 102.304 159.239 75.4348 130.978 70.8696Z" />
            <path fill="#27272A" d="M83.2609 82.3913C83.2609 85.4348 80.8696 87.8261 77.8261 87.8261C74.7826 87.8261 72.3913 85.4348 72.3913 82.3913C72.3913 79.3478 74.7826 76.9565 77.8261 76.9565C80.8696 76.9565 83.2609 79.3478 83.2609 82.3913Z" />
            <path fill="#27272A" d="M127.609 82.3913C127.609 85.4348 125.217 87.8261 122.174 87.8261C119.13 87.8261 116.739 85.4348 116.739 82.3913C116.739 79.3478 119.13 76.9565 122.174 76.9565C125.217 76.9565 127.609 79.3478 127.609 82.3913Z" />
            <path fill="#FFA500" d="M100 110.652C106.957 110.652 112.522 105.087 112.522 98.1304C112.522 91.1739 106.957 85.6087 100 85.6087C93.0435 85.6087 87.4783 91.1739 87.4783 98.1304C87.4783 105.087 93.0435 110.652 100 110.652Z" />
            <path fill="#FFA500" d="M100 181.087C102.391 181.087 104.348 179.13 104.348 176.739C104.348 174.348 102.391 172.391 100 172.391C97.6087 172.391 95.6522 174.348 95.6522 176.739C95.6522 179.13 97.6087 181.087 100 181.087Z" />
            <path fill="#FFA500" d="M78.0435 181.087C80.4348 181.087 82.3913 179.13 82.3913 176.739C82.3913 174.348 80.4348 172.391 78.0435 172.391C75.6522 172.391 73.6957 174.348 73.6957 176.739C73.6957 179.13 75.6522 181.087 78.0435 181.087Z" />
            <path fill="#FFA500" d="M121.957 181.087C124.348 181.087 126.304 179.13 126.304 176.739C126.304 174.348 124.348 172.391 121.957 172.391C119.565 172.391 117.609 174.348 117.609 176.739C117.609 179.13 119.565 181.087 121.957 181.087Z" />
            <path d="M100 95.6522L112.522 101.435L100 107.217L87.4783 101.435L100 95.6522Z" fill="#FFD700" />
        </g>
        <defs>
            <clipPath id="clip0_105_2">
                <path fill="#fff" d="M0 0H200V200H0z" />
            </clipPath>
        </defs>
    </svg>
);


export const ChatIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

export const ScreenMonitorIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export const VideoIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
);

export const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

export const RobotIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 3a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0018 3M6 3v3.75m12 0V3m-6 4.5v.75m0 3v.75m0 3v.75m0 3V21m-4.5-6.75h9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 10.125a.375.375 0 11-.75 0 .375.375 0 01.75 0zm6 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);


export const SendIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.544l4.253-1.215a.75.75 0 01.378.378l-1.215 4.253a.75.75 0 00.544.95l4.95 1.414a.75.75 0 00.95-.826l-2.289-8.012a.75.75 0 00-.95-.544l-8.012 2.289z" />
    <path d="M13.243 3.243a.75.75 0 011.06 1.06l-2.47 2.47a.75.75 0 01-1.06-1.06l2.47-2.47z" />
  </svg>
);

export const LoadingSpinner: React.FC<IconProps> = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const SpeakingIndicator: React.FC<IconProps> = ({ className }) => (
  <div className={`flex items-center justify-center gap-1 h-8 ${className}`}>
    <span className="w-1 h-full bg-indigo-400 rounded-full speak-bar" style={{ animationDelay: '-0.5s' }} />
    <span className="w-1 h-full bg-indigo-400 rounded-full speak-bar" style={{ animationDelay: '-0.4s' }} />
    <span className="w-1 h-full bg-indigo-400 rounded-full speak-bar" style={{ animationDelay: '-0.2s' }} />
    <span className="w-1 h-full bg-indigo-400 rounded-full speak-bar" style={{ animationDelay: '-0.3s' }} />
    <span className="w-1 h-full bg-indigo-400 rounded-full speak-bar" />
  </div>
);

export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ClipboardIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25H9a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);


export const ClockIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l.813-2.846a4.5 4.5 0 00-3.09-3.09L13.125 5.25l-.813 2.846a4.5 4.5 0 00-3.09 3.09L6.375 12l2.846.813a4.5 4.5 0 003.09 3.09L13.125 18.75l.813-2.846a4.5 4.5 0 003.09-3.09L21.75 12l-2.846-.813a4.5 4.5 0 00-3.09-3.09z" />
    </svg>
);

export const DocumentTextIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const QualityIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.804 21.342c.386.198.824.198 1.21 0l3.823-1.962a.75.75 0 00.466-.676V8.432a.75.75 0 00-.465-.676l-3.823-1.962a1.442 1.442 0 00-1.21 0L6.98 7.756a.75.75 0 00-.465.676v8.272a.75.75 0 00.466.676l3.823 1.962z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.166 8.432 12 4.67l6.834 3.762m-13.668 0L12 12.194l6.834-3.762M12 21.342V12.194" />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);