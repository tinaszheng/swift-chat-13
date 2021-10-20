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
};

type Playlist = PlaylistItem[];

const defaultPlaylist: Playlist = [
    {
        url: "https://www.youtube.com/embed/YPlNBb6I8qU",
        length: 280,
        name: "cowboy like me",
    },
    {
        url: "https://www.youtube.com/embed/9nIOx-ezlzA",
        length: 259,
        name: 'ivy',
    },
    {
        url: "https://www.youtube.com/embed/c_p_TBaHvos",
        length: 278,
        name: 'coney island',
    },
    {
        url: "https://www.youtube.com/embed/zI4DS5GmQWE",
        length: 225,
        name: 'dorothea',
    }
];

// used for testing since these videos are short
const testPlaylist: Playlist = [
    {
        url: "https://www.youtube.com/embed/668nUCeBHyY",
        length: 19,
        name: 'test1',
    },
    {
        url: "https://www.youtube.com/embed/XbqFZMIidZI",
        length: 29,
        name: 'test2',
    },
    {
        url: "https://www.youtube.com/embed/oNenAD2gq8o",
        length: 19,
        name: 'test3',
    },
    {
        url: "https://www.youtube.com/embed/HiWa-UrBN0c",
        length: 11,
        name: 'test4',
    }
]

export default defaultPlaylist;