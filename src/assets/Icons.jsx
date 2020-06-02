import React from 'react';

export const viewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
        <g>
            <path
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                d="M23.5,12
			c0,0-5.148,6.5-11.5,6.5S0.5,12,0.5,12S5.648,5.5,12,5.5S23.5,12,23.5,12z"
            />

            <circle
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                cx="12"
                cy="12"
                r="4"
            />
        </g>
    </svg>
);

export const StackedDocumentsIcon = widthAndHeight => (
    <svg xmlns="http://www.w3.org/2000/svg" width={widthAndHeight} height={widthAndHeight} viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path d="M20.5 18.5h-13v-17h8l5 5zM18.5 18.5v2h-13v-17h2M16.5 20.5v2h-13v-17h2M15.5 1.5v5h5" />
        </g>
    </svg>
);

export const HomeIcon = widthAndHeight => (
    <svg xmlns="http://www.w3.org/2000/svg" width={widthAndHeight} height={widthAndHeight} viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path d="M3.5 13.5v10h6v-7h5v7h6v-9.5M.5 13l11.5-11.5 11.5 11.5M16 2.5h3.5v3.5" />
        </g>
    </svg>
);

export const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M22.5 17.012c0 .828-.672 1.5-1.5 1.5h-18c-.828 0-1.5-.672-1.5-1.5v-11c0-.829.672-1.5
            1.5-1.5h18c.828 0 1.5.671 1.5 1.5v11zM22 5.012l-10 8-10-8"
            />
        </g>
    </svg>
);

export const DialogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M7.919 23.5h7.581v-4.5c0-.5-3-2-5.5-3v-2s1-.35
            1-2.5c.695 0 1-2 .032-2 0-.212.766-1.308.468-2.5-.5-2-5.5-2-6 0-2.105-.431-.5 2.212-.5 2.5-1
            0-.696 2 0 2 0 2.15 1 2.5 1 2.5v2c-2.5 1-5.5 2.5-5.5 3v4.5h7.419z"
            />
            <path
                strokeLinecap="round"
                d="M18 23.5h5.5v-4.5c0-.5-2.5-1.2-4.5-2v-1.5s1-.28 1-2c.557
                  0 .774-2 0-2 0-.169.811-1.067.5-2-.5-1.5-4.5-1.5-5 0-1.685-.345-.5
                  1.77-.5 2-.8 0-.557 2 0 2 0 1.72 1 2 1 2v1"
            />
        </g>
    </svg>
);

export const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M7.31 21.675l-6.466 1.517 1.517-6.465 15.6-15.602c.781-.781 2.049-.781 2.829
            0l2.122 2.122c.78.781.78 2.046 0 2.829l-15.602 15.599zM22.207 6.784l-4.954-4.952M20.78
            8.211l-4.941-4.965M7.562 21.425l-4.95-4.951"
            />
        </g>
    </svg>
);

export const PaymentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path d="M.5 13.5h4v8.042h-4z" />
            <path
                strokeLinecap="round"
                d="M4.5 20c10.5 3.5 7 3.5 19-2.5-1.063-1.062-1.902-1.313-3-1l-4.434
                  1.471M4.5 14.5h3c2.353 0 4 1.5 4.5 2h3c1.594 0 1.594 2 0 2h-5.5"
            />
            <circle strokeLinecap="round" cx="17.5" cy="3.5" r="3" />
            <circle strokeLinecap="round" cx="12.5" cy="10.5" r="3" />
            <path strokeLinecap="round" d="M12.5 9.5v2M17.5 2.5v2" />
        </g>
    </svg>
);

export const BankNote = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path d="M.513 4.5h23v14h-23z" />
            <circle cx="12.013" cy="11.5" r="3" />
            <circle cx="5.013" cy="9" r=".5" />
            <circle cx="19.013" cy="14" r=".5" />
            <path
                d="M21.513 14.5c0 1.105-.896 2-2 2h-15c-1.104
            0-2-.895-2-2v-6c0-1.104.896-2 2-2h15c1.104 0 2 .896 2 2v6z"
            />
        </g>
    </svg>
);

export const ApplicationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path d="M.513.5h23v23h-23zM6.513 5.5h4M3.513 8.5h7M3.513 11.5h7M3.513 14.5h17M3.513 17.5h12" />
            <path d="M12.513 3.5h8v8h-8z" />
        </g>
    </svg>
);

export const ReceiptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M4.513 23.5l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2v-23l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2zM7.513
            6.5h8M7.513 9.5h4M7.513 12.5h4M7.513 15.5h3M16.013 17.5v1M16.013 10.5v1M14.513 16c0
            .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5-.672-1.5-1.5-1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5"
            />
        </g>
    </svg>
);

export const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M20.513 21c0 1.375-1.125 2.5-2.5 2.5h-13c-1.375 0-2.5-1.125-2.5-2.5v-18c0-1.375
            1.125-2.5 2.5-2.5h13c1.375 0 2.5 1.125 2.5 2.5v18zM18.513 5.606c0 .492-.402.894-.895.894h-12.211c-.492
            0-.895-.402-.895-.894v-2.211c0-.492.402-.895.895-.895h12.211c.492 0 .895.402.895.895v2.211zM2.513
            15.5h18M2.513 8.5h18M11.513 8.5v15M4.513 12h4M14.013 12.5h4M5.435 17.815l3.156 3.185M5.435
            21l3.156-3.156M14.013 20.5h4M14.013 18.5h4M6.513 10v4"
            />
        </g>
    </svg>
);

export const CreditCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M23.513 17.5c0 1.104-.896 2-2 2h-19c-1.104 0-2-.896-2-2v-10c0-1.104.896-2 2-2h19c1.104 0 2 .896
             2 2v10zM.513 9.5h23M20.513 12.5h-3M11.513 12.5h-8M6.513 14.5h-3"
            />
        </g>
    </svg>
);

export const CheckListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path d="M.5.5h23v23h-23z" />
            <path strokeLinecap="round" d="M3.5 7.5l2 2 5-5M3.5 16.5l2 2 5-5M12.5 8.5h8M12.5 17.5h8" />
        </g>
    </svg>
);

export const FemaleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <circle cx="11.5" cy="4" r="3.5" />
            <path d="M11.5 9c-3.038 0-5.5 4.5-5.5 9.5h3.5v5h4v-5h3.5c0-5-2.463-9.5-5.5-9.5z" />
        </g>
    </svg>
);

export const MaleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <circle cx="11.5" cy="4" r="3.5" />
            <path d="M17 9.5h-11c0 4.069 1.547 6.442 3.5 7.5v6.5h4v-6.5c1.951-1.058 3.5-3.431 3.5-7.5z" />
        </g>
    </svg>
);

export const IDCard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M.5 3.5v17h4v-1.5c0-.962.787-1.75 1.75-1.75.962 0 1.75.788 1.75
            1.75v1.5h8v-1.5c0-.962.787-1.75 1.75-1.75.962 0 1.75.788 1.75 1.75v1.5h4v-17h-23zM13
            13.5h8M13 11.5h8M13 9.5h8M13 7.5h4"
            />
            <path
                strokeLinecap="round"
                d="M7 14.5h-4v-2s1-1.5 3-1.5v-1s-1-.5-1-2c0-1 0-2 2-2s2 1 2 2c0 1.5-1 2-1 2v1c2 0 3 1.5 3 1.5v2h-4z"
            />
        </g>
    </svg>
);

export const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path
            stroke="#000"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M8.586 7.902c.902-.904.902-2.367 0-3.27l-2.454-2.454c-.903-.903-2.368-.903-3.271
              0l-1.345 1.345c-1.168 1.168-1.349 2.989-.439 4.366 3.909 5.91 9.124 11.125 15.034 15.034 1.375.909
              3.201.728 4.365-.437l1.346-1.347c.903-.903.903-2.368 0-3.271l-2.453-2.453c-.902-.904-2.367-.904-3.271
              0l-.817.818c-2.69-2.205-5.309-4.824-7.513-7.515l.818-.816z"
            fill="none"
        />
    </svg>
);

export const StackedCoinsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <ellipse cx="8.013" cy="2.5" rx="7.5" ry="2" />
            <path
                d="M15.513 2.5v3c0 1.104-3.357 2-7.5 2-4.142 0-7.5-.896-7.5-2v-3M15.513 5.5v3c0 1.104-3.357 2-7.5
            2-4.142 0-7.5-.896-7.5-2v-3"
            />
            <ellipse cx="16.013" cy="15.5" rx="7.5" ry="2" />
            <path
                d="M23.513 15.5v3c0 1.104-3.357 2-7.5 2-4.142 0-7.5-.896-7.5-2v-3M23.513 18.5v3c0 1.104-3.357
            2-7.5 2-4.142 0-7.5-.896-7.5-2v-3M15.513 8.5v3c0 1.104-3.357 2-7.5 2-4.142 0-7.5-.896-7.5-2v-3M.513
            11.5v3c0 1.104 3.358 2 7.5 2h.5M.513 14.5v3c0 1.104 3.358 2 7.5 2h.5M15.513 11.5v2"
            />
        </g>
    </svg>
);

export const WorldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <circle cx="12" cy="12" r="11.5" />
            <path
                d="M20.5 4.256s-.5 2.744-2.5 3.744c-2-.5-4 1-3.5 1l1 2c.5.5 1.5 0 1.5 0 1.25 1.25-2
            3.5-2 4s1.25.75.5 1.5l-1.5 1c0 2.5-2.5 2.5-3 2.5s-1.5-2-1.5-2.5.5-1
            .5-1.5l-1-1.5c0-2-1.5-1.5-3-1.5l-1.5-2s0-3.5 2.5-4l2.5.5c1 1 3 0 4 0 0 0
            .5-3.5-.5-3s-1.896.113-2-1c-.146-1.562 4.363-2.5 4.363-2.5"
            />
        </g>
    </svg>
);

export const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path
            fill="#C6C2BF"
            stroke="none"
            d="M12 22.4s10.5-8.1 10.5-15.8S13.2-1.7 12 6C10.8-1.7 1.5-1.1 1.5 7.2 1.5 15.4 12 22.4 12 22.4z"
        ></path>
    </svg>
);

export const AirplaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M20.734 5.055l-13.668 5.945-3-1.5-3.5 1.5 4.5 4.5 7.5-3-3 8 4-2 4-8 4.697-1.75c1.021-.423
            1.506-1.593 1.084-2.613-.423-1.021-1.593-1.504-2.613-1.082zM16.238 7.01l-6.656-2.748-3.695 1.531 6.738 2.789"
            />
        </g>
    </svg>
);

export const FileView = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path d="M11 21.5h-10.5v-21h11l5 5v4.5" />
            <path strokeLinecap="round" d="M11.5.5v5h5" />
            <circle cx="17.305" cy="17.306" r="3.805" />
            <path strokeLinecap="round" d="M20 20l3.5 3.5" />
        </g>
    </svg>
);

export const LocationPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
            <path
                d="M19.5 8c0 4.144-7.5 15.5-7.5 15.5s-7.5-11.356-7.5-15.5c0-4.142
          3.357-7.5 7.5-7.5 4.142 0 7.5 3.358 7.5 7.5z"
            />
            <circle cx="12" cy="8" r="3" />
        </g>
    </svg>
);

export const PersonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path
            stroke="#000"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M12 23.5h11.5s0-2.057-1-4.057c-.746-1.491-4-2.5-8-4v-3s1.5-1 1.5-3c.5 0 1-2 0-2.5 0-.297 1.339-2.801 1-4.5-.5-2.5-7.5-2.5-8-.5-3 0-1 4.594-1 5-1 .5-.5 2.5 0 2.5 0 2 1.5 3 1.5 3v3c-4 1.5-7.255 2.509-8 4-1 2-1 4.057-1 4.057h11.5z"
            fill="none"
        />
    </svg>
);
