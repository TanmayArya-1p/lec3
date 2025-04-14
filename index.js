const bannerCount = 10;
const imageCount = 12;
const bannerContainer = document.getElementById('poke-banners-container')

const bannerTemplate = document.createElement('div');
bannerTemplate.className = 'poke-banner';
const bannerInnerTemplate = document.createElement('div');
bannerInnerTemplate.className = 'poke-banner-inner';
const logoTemplate = document.createElement('img');
logoTemplate.src = '/assets/pokemon-logo.svg';
logoTemplate.alt = 'PokeLAN Logo';
logoTemplate.className = 'poke-logo';

for(let i = 0; i < 2*imageCount; i++) {
    bannerInnerTemplate.appendChild(logoTemplate.cloneNode(true));
}

bannerTemplate.appendChild(bannerInnerTemplate);


for(let i = 0; i < bannerCount; i++) {
    const banner = bannerTemplate.cloneNode(true);
    
    if(i % 2 == 0) {
        banner.style.backgroundColor = '#ff0000';
        banner.classList.add('right-scroll');
    } else {
        banner.style.backgroundColor = '#cc0000';
        banner.classList.add('left-scroll');
    }
    bannerContainer.appendChild(banner);
}


