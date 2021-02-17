document.querySelectorAll('.card').forEach((card)=>{
    card.addEventListener('mouseover', ()=>{
        card.classList.add('shadow');
    });
    card.addEventListener('mouseleave', ()=>{
        card.classList.remove('shadow');
    });
});