try {
    const checkoutButton = document.querySelector('#checkout-button');
    
    checkoutButton.addEventListener('click', ()=>{
        const sellerPublicKey = document.querySelector('input[name="source"]').value;
        const stripe = Stripe(sellerPublicKey);
    
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'x-www-form-urlencoded',
                'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value
            }
        }).then((response)=>{
            return response.json();
        }).then((session)=>{
            return stripe.redirectToCheckout({sessionId: session.id});
        }).then((result)=>{
            if (result.error){
                alert(result.error.message);
            }
        }).catch((error)=>{
            console.log(error);
        });
    });
} catch (error) {}