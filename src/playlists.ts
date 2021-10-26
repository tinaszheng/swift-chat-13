export const getPlaylistOffset = (playlistCreateTime: number, playlistTotalTime: number): number => {
    const differenceMilliseconds = Date.now() - playlistCreateTime;
    const differenceSeconds = Math.floor(differenceMilliseconds / 1000);
    const offset = differenceSeconds % playlistTotalTime;
    return offset;
};

// assume playlistOffset < playlist total length
export const getVideoAndOffset = (playlist: Playlist, playlistOffset: number): [PlaylistItem, number, number] => {
    let offsetRemaining = playlistOffset;
    let currIndex = 0;

    while (offsetRemaining > 0) {
        const currVideo = playlist[currIndex];
        if (offsetRemaining < currVideo.length) {
            break;
        }

        offsetRemaining -= currVideo.length;
        currIndex += 1;
    };

    return [playlist[currIndex], currIndex, offsetRemaining];
};

type PlaylistItem = {
    url: string;
    length: number;
    name: string;
    id: string;
};

type Playlist = PlaylistItem[];

const defaultPlaylist: Playlist = [
    {
        url: "https://www.youtube.com/embed/YPlNBb6I8qU",
        length: 280,
        name: "cowboy like me",
        id: "YPlNBb6I8qU",
    },
    {
        url: "https://www.youtube.com/embed/9nIOx-ezlzA",
        length: 259,
        name: 'ivy',
        id: "9nIOx-ezlzA",
    },
    {
        url: "https://www.youtube.com/embed/c_p_TBaHvos",
        length: 278,
        name: 'coney island',
        id: "c_p_TBaHvos",
    },
    {
        url: "https://www.youtube.com/embed/zI4DS5GmQWE",
        length: 225,
        name: 'dorothea',
        id: "zI4DS5GmQWE",
    }
];

// used for testing since these videos are short
const testPlaylist: Playlist = [
    {
        url: "https://www.youtube.com/embed/668nUCeBHyY",
        length: 19,
        name: 'test1',
        id: "668nUCeBHyY",
    },
    {
        url: "https://www.youtube.com/embed/XbqFZMIidZI",
        length: 29,
        name: 'test2',
        id: "XbqFZMIidZI",
    },
    {
        url: "https://www.youtube.com/embed/oNenAD2gq8o",
        length: 19,
        name: 'test3',
        id: "oNenAD2gq8o",
    },
    {
        url: "https://www.youtube.com/embed/HiWa-UrBN0c",
        length: 11,
        name: 'test4',
        id: 'HiWa-UrBN0c',
    }
]

export default defaultPlaylist;