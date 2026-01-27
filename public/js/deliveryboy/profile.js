 
        lucide.createIcons();

        // Show Image Preview
        function loadFile(event) {
            var image = document.getElementById('displayPic');
            image.src = URL.createObjectURL(event.target.files[0]);
        }

        function saveProfile(e) {
            e.preventDefault();
            alert("Profile Updated Successfully!");
            // Yaha backend code aayega
        }