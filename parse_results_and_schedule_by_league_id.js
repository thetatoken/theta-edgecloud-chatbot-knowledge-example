const axios = require('axios');
const { RiotApiKey, RiotApiBaseUrl } = require('../../constants');
const { saveToClientDirectory } = require('../../api');

const BASE_URL = RiotApiBaseUrl + '/getSchedule?hl=en-US&leagueId=';

async function getScheduleByLeagueId(leagueId) {
    let allSchedules = [];
    let hasMorePages = true;
    let pageToken = '';

    while (hasMorePages) {
        const url = pageToken ? `${BASE_URL}${leagueId}&pageToken=${pageToken}` : `${BASE_URL}${leagueId}`;
        const res = await axios.get(
            url,
            {
                headers: { 'x-api-key': RiotApiKey }
            }
        );

        const schedules = res.data.data.schedule.events;
        allSchedules = [...allSchedules, ...schedules];

        // Check if there are older games to fetch
        if (res.data.data.schedule.pages && res.data.data.schedule.pages.older) {
            pageToken = res.data.data.schedule.pages.older;
        } else {
            hasMorePages = false;
        }
    }

    return allSchedules;
}

async function parseScheduleAndResultsByLeagueId({saveToFile = false, leagueId}) {
    const schedules = await getScheduleByLeagueId(leagueId);
    
    /***** Save schedules and metadata *****/
    function generateCsvData(games) {
        // Sort games by date
        const sortedGames = [...games].sort((a, b) => {
            const dateA = new Date(a.startTime);
            const dateB = new Date(b.startTime);
            return dateA - dateB;
        });

        let data = 'date,start_time,state,stage,team1,team1_score,team2,team2_score,winner,loser\n';
        
        for (const schedule of sortedGames) {
            let timestamp = Date.parse(schedule.startTime);
            let date_time = new Date(timestamp);
            let date = date_time.toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).replace(',', '');
            let start_time = date_time.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true });

            let state = schedule.state;
            let blockName = schedule.blockName;
            const stage = blockName;

            let team1 = schedule.match.teams[0].name ?? 'TBD';
            let team2 = schedule.match.teams[1].name ?? 'TBD';
            let team1_score = schedule.match.teams[0].result?.gameWins ?? 'TBD';
            let team2_score = schedule.match.teams[1].result?.gameWins ?? 'TBD';
            
            let winner = 'TBD', loser = 'TBD';
            if (state === 'completed') {
                if (schedule.match.teams[0].result.outcome === 'win') {
                    winner = team1;
                    loser = team2;
                } else {
                    winner = team2;
                    loser = team1;
                }
            }

            data += `${date},${start_time} PST,${state},${stage},${team1},${team1_score},${team2},${team2_score},${winner},${loser}\n`;
        }
        return data;
    }

    const matchResultsSchema = {
        columns: [
            { name: "date", type: "DATE" },
            { name: "start_time", type: "TEXT" },
            { name: "state", type: "TEXT" },
            { name: "stage", type: "TEXT" },
            { name: "team1", type: "TEXT" },
            { name: "team1_score", type: "INTEGER" },
            { name: "team2", type: "TEXT" },
            { name: "team2_score", type: "INTEGER" },
            { name: "winner", type: "TEXT" },
            { name: "loser", type: "TEXT" }
        ]
    };

    const metadata = {
        "query_type": "sql",
        "sql_schema": matchResultsSchema,
        "sql_description": "Worlds 2024 schedule. The 'stage' column indicates which part of the stage the game belongs to (e.g. 'Play-Ins', 'Swiss', etc). Sample data: date='September 25 2024', start_time='12:00 PM PST', state='completed', stage='Play-Ins', team1='Movistar KOI', team1_score=2, team2='MGN Vikings Esports', team2_score=0, winner='Movistar KOI', loser='MGN Vikings Esports'"
    };
    
    const allGamesData = generateCsvData(schedules);

    if (saveToFile) {
        saveToClientDirectory(allGamesData, `${leagueId}_schedule_and_results.csv`, 'leagueoflegends');
        saveToClientDirectory(metadata, `${leagueId}_schedule_and_results_metadata.json`, 'leagueoflegends');
    }

    return {
        data: allGamesData,
        metadata
    };
}

module.exports = { parseScheduleAndResultsByLeagueId, getScheduleByLeagueId };
