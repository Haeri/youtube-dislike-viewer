const YT_DISLIKE_API = 'https://returnyoutubedislikeapi.com/votes?videoId=';
const YT_EMBED_API = 'https://www.youtube.com/embed/';

let preview_panel_target_ui;
let preview_panel_template_ui;
let video_id_ui;
let search_btn_ui;
let preview_panel_spinner_ui;

function init() {
    // Cache UI elements
    preview_panel_target_ui = document.getElementById('preview-panel-target');
    preview_panel_template_ui = document.getElementById('preview-panel-template');
    video_id_ui = document.getElementById('video-id');
    search_btn_ui = document.getElementById('search-btn');
    preview_panel_spinner_ui = document.getElementById('preview-panel-spinner');

    // Add event listener to input and button
    search_btn_ui.addEventListener('click', () => {
        load_by_vide_id(video_id_ui.value);
    });
    video_id_ui.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            load_by_vide_id(video_id_ui.value);
        }
    });

    // Load Video from GET parameter "v"
    let queryString = window.location.search;
    if (!queryString) return;
    let urlParams = new URLSearchParams(queryString);
    let value = urlParams.get('v')
    if (value) {
        video_id_ui.value = value;
        load_by_vide_id(value);
    }
}

function format_number(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function format_date(d) {
    return new Date(d).toLocaleString('en-us',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
}

function render_error(reason) {
    preview_panel_spinner_ui.classList.remove('show');
    preview_panel_target_ui.classList.add('show');

    preview_panel_target_ui.innerHTML = `
    <div class="panel error-panel">
    <span>${reason}</span>
    </div>
    `;
}

async function load_by_vide_id(id) {
    preview_panel_target_ui.classList.remove('show');
    preview_panel_spinner_ui.classList.add('show');

    if (id === "") {
        render_error('No Video id provided.');
        return;
    }

    let clone_node;
    let data;

    try {
        clone_node = preview_panel_template_ui.content.cloneNode(true);
        clone_node.getElementById('yt-vide-embed').src = YT_EMBED_API + id;

        let headers = await fetch(YT_DISLIKE_API + id);
        if (!headers.ok) throw "Status " + headers.status;
        data = await headers.json();
    }catch(e) {
        render_error(`Video with id '${id}' not found.`);
        return;
    }

    clone_node.getElementById('views-slot').innerText = format_number(data.viewCount);
    clone_node.getElementById('date-slot').innerText = format_date(data.dateCreated);
    clone_node.getElementById('upvote-slot').innerText = format_number(data.likes);
    clone_node.getElementById('downvote-slot').innerText = format_number(data.dislikes);

    preview_panel_target_ui.innerHTML = "";
    preview_panel_target_ui.appendChild(clone_node);

    preview_panel_spinner_ui.classList.remove('show');
    preview_panel_target_ui.classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});