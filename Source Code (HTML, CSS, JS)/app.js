// Initialize map centered on Zanzibar Mjini Magharibi, Tanzania
const map = L.map('map').setView([-6.1667, 39.1833], 13);

// Add OpenStreetMap tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     maxZoom: 19
// }).addTo(map);

// Define multiple basemaps
var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
});

var darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
});

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


// 1. Polygon layer – Administrative boundaries
const boundariesLayer = L.layerGroup().addTo(map);

// 2. Line layer – Roads / major paths
const roadsLayer = L.layerGroup().addTo(map);

// 3. Point layer – Sports & recreational facilities
const facilitiesLayer = L.layerGroup().addTo(map);
// Start with Positron
positron.addTo(map);


function addMarkers() {
    facilitiesData.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        const type = feature.properties.type || 'playground'; // fallback

        const marker = L.marker([coordinates[1], coordinates[0]], {
            icon: markerIcons[type]
        }).bindPopup(createPopupContent(feature));

        marker.facilityData = feature;
        allMarkers.push(marker);

        // Important change: add to facilitiesLayer instead of map
        marker.addTo(facilitiesLayer);
    });
}// Administrative boundaries (polygon layer)
fetch('boundaries.geojson')   // ← replace with your actual file name or URL
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: "#1e40af",       // blue border
                weight: 2,
                opacity: 0.8,
                fillColor: "#60a5fa",
                fillOpacity: 0.15
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(`<b>${feature.properties.name}</b><br>Administrative Boundary`);
                }
            }
        }).addTo(boundariesLayer);
    })
    .catch(err => console.error("Boundaries load failed:", err));

// Roads (line layer)
fetch('roads.geojson')   // ← replace with your actual file name or URL
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: "#dc2626",       // red roads
                weight: 3.5,
                opacity: 0.9
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(`<b>${feature.properties.name}</b><br>Road`);
                }
            }
        }).addTo(roadsLayer);
    })
    .catch(err => console.error("Roads load failed:", err));
    

// Layer control
var baseMaps = {
    "CARTO Positron (Light)": positron,
    "CARTO Dark Matter": darkMatter,
    "OpenStreetMap": osm
};

L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);


// Create marker icons for different facility types
const markerIcons = {
    stadium: L.divIcon({
        html: '<div style="background-color: #35a035; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">⚽</div>',
        iconSize: [30, 30],
        className: 'marker-stadium'
    }),
    playground: L.divIcon({
        html: '<div style="background-color: #4ECDC4; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎪</div>',
        iconSize: [30, 30],
        className: 'marker-playground'
    }),
    gym: L.divIcon({
        html: '<div style="background-color: #FFE66D; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">💪</div>',
        iconSize: [30, 30],
        className: 'marker-gym'
    })
};

// Store markers for filtering
let allMarkers = [];
let currentFilter = 'all';

// Function to create popup content
function createPopupContent(feature) {
    const props = feature.properties;
    let content = `<div class="facility-popup">
        <h3>${props.name}</h3>
        <div class="facility-type">${props.type}</div>
        <p><strong>Address:</strong> ${props.address || 'N/A'}</p>
        <p><strong>Phone:</strong> ${props.phone || 'N/A'}</p>`;

    if (props.website) {
        content += `<p><strong>Website:</strong> <a href="${props.website}" target="_blank">${props.website}</a></p>`;
    }

    if (props.capacity) {
        content += `<p><strong>Capacity:</strong> ${props.capacity.toLocaleString()}</p>`;
    }

    if (props.equipment) {
        content += `<p><strong>Equipment:</strong> ${props.equipment.join(', ')}</p>`;
    }

    if (props.amenities) {
        content += `<p><strong>Amenities:</strong> ${props.amenities.join(', ')}</p>`;
    }

    content += '</div>';
    return content;
}

// Function to add markers to map
function addMarkers() {
    facilitiesData.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        const marker = L.marker([coordinates[1], coordinates[0]], {
            icon: markerIcons[feature.properties.type]
        }).bindPopup(createPopupContent(feature));

        marker.facilityData = feature;
        allMarkers.push(marker);
        marker.addTo(map);
    });
}

// Function to update facilities list
function updateFacilitiesList(facilities = facilitiesData.features) {
    const listContainer = document.getElementById('facilitiesList');
    listContainer.innerHTML = '';

    facilities.forEach((feature, index) => {
        const item = document.createElement('div');
        item.className = 'facility-item';
        item.innerHTML = `
            <div class="facility-name">${feature.properties.name}</div>
            <div class="facility-type">${feature.properties.type}</div>
            <div class="facility-coords">${feature.geometry.coordinates[1].toFixed(4)}, ${feature.geometry.coordinates[0].toFixed(4)}</div>
        `;

        item.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.facility-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            // Pan to marker and open popup
            const coords = feature.geometry.coordinates;
            map.setView([coords[1], coords[0]], 15);
            allMarkers[index].openPopup();
        });

        listContainer.appendChild(item);
    });
}

// Custom Legend Control
var legend = L.control({ position: 'bottomleft' });  // You can change to 'bottomleft' if preferred

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');

    div.innerHTML += '<h5>Key</h5>';

    // Stadium
    div.innerHTML +=
        '<div><i style="background:#35a035"></i> <span class="emoji">⚽</span> Stadium</div>';

    // Playground
    div.innerHTML +=
        '<div><i style="background:#4ECDC4"></i> <span class="emoji">🎪</span> Playground</div>';

    // Gym
    div.innerHTML +=
        '<div><i style="background:#FFE66D"></i> <span class="emoji">💪</span> Gym / Fitness Centre</div>';

    // Prevent click propagation (so map doesn't zoom/pan when clicking legend)
    L.DomEvent.disableClickPropagation(div);

    return div;
};

legend.addTo(map);

// Function to filter markers
function filterMarkers(type) {
    currentFilter = type;
    allMarkers.forEach(marker => {
        if (type === 'all' || marker.facilityData.properties.type === type) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });

    // Filter list
    if (type === 'all') {
        updateFacilitiesList();
    } else {
        const filtered = facilitiesData.features.filter(f => f.properties.type === type);
        updateFacilitiesList(filtered);
    }
}

// Search functionality
function searchFacilities(query) {
    const results = facilitiesData.features.filter(feature => {
        const name = feature.properties.name.toLowerCase();
        const address = (feature.properties.address || '').toLowerCase();
        const q = query.toLowerCase();
        return name.includes(q) || address.includes(q);
    });

    updateFacilitiesList(results);

    // Update markers
    allMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    const resultMarkers = allMarkers.filter(marker => 
        results.some(r => r.properties.name === marker.facilityData.properties.name)
    );

    resultMarkers.forEach(marker => marker.addTo(map));

    // Fit bounds to results
    if (resultMarkers.length > 0) {
        const group = new L.featureGroup(resultMarkers);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (query.trim()) {
        searchFacilities(query);
    } else {
        filterMarkers(currentFilter);
    }
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const type = e.target.dataset.type;
        filterMarkers(type);
        document.getElementById('searchInput').value = '';
    });
});

// Initialize the application
function init() {
    addMarkers();
    updateFacilitiesList();
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
