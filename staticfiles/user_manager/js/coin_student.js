  const leaderboard = [
    { id: "1", name: "Emma Wilson", balance: 5230, avatar: "https://via.placeholder.com/32" },
    { id: "2", name: "Michael Brown", balance: 4890, avatar: "https://via.placeholder.com/32" },
    { id: "3", name: "Sophia Davis", balance: 4560, avatar: "https://via.placeholder.com/32" },
    { id: "4", name: "James Miller", balance: 3980, avatar: "https://via.placeholder.com/32" },
    { id: "5", name: "Alex Johnson", balance: 2450, avatar: "https://via.placeholder.com/32" },
    { id: "6", name: "Olivia Smith", balance: 2340, avatar: "https://via.placeholder.com/32" },
    { id: "7", name: "William Taylor", balance: 2100, avatar: "https://via.placeholder.com/32" },
    { id: "8", name: "Isabella Jones", balance: 1950, avatar: "https://via.placeholder.com/32" },
    { id: "9", name: "Ethan Anderson", balance: 1820, avatar: "https://via.placeholder.com/32" },
    { id: "10", name: "Charlotte Thomas", balance: 1760, avatar: "https://via.placeholder.com/32" },
  ];
  
document.addEventListener('DOMContentLoaded', function() {
    // Populate student info
    document.getElementById('student-name').textContent = `${student.Last_Name} ${student.First_Name}`;
    document.getElementById('student-balance').textContent = student.balance;
    document.getElementById('student-rank').textContent = `Current Rank: #23`;
    
    // Set student avatar or fallback to initials
    const studentAvatar = document.getElementById('student-avatar').querySelector('img');
    const studentInitials = document.getElementById('student-initials');
    
    studentAvatar.src = student.avatar;
    studentAvatar.onerror = function() {
      this.style.display = 'none';
      studentInitials.style.display = 'flex';
    };
    
    // Generate initials from name
    const initials = `${student.First_Name[0]}${student.Last_Name[0]}`
    studentInitials.textContent = initials;
    
    // Populate leaderboard
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    leaderboard.forEach((leader, index) => {
      const row = document.createElement('tr');
      row.className = 'leaderboard-row';
      
      // Highlight current user
      if (leader.id === student.id) {
        row.classList.add('current-user');
      }
      
      // Rank column with trophies for top 3
      const rankCell = document.createElement('td');
      if (index < 3) {
        const trophyIcon = document.createElement('i');
        trophyIcon.className = 'fas fa-trophy';
        
        if (index === 0) {
          trophyIcon.classList.add('trophy-gold');
        } else if (index === 1) {
          trophyIcon.classList.add('trophy-silver');
        } else {
          trophyIcon.classList.add('trophy-bronze');
        }
        
        rankCell.appendChild(trophyIcon);
      } else {
        rankCell.textContent = `#${index + 1}`;
      }
      
      // Student column with avatar and name
      const studentCell = document.createElement('td');
      const studentDiv = document.createElement('div');
      studentDiv.className = 'student-cell';
      
      // Avatar
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      
      const avatarImg = document.createElement('img');
      avatarImg.src = leader.avatar;
      avatarImg.alt = leader.name;
      
      const avatarFallback = document.createElement('div');
      avatarFallback.className = 'avatar-fallback';
      avatarFallback.textContent = leader.name.split(' ').map(n => n[0]).join('');
      
      avatarImg.onerror = function() {
        this.style.display = 'none';
        avatarFallback.style.display = 'flex';
      };
      
      avatar.appendChild(avatarImg);
      avatar.appendChild(avatarFallback);
      
      // Name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = leader.name;
      if (leader.id === student.id) {
        nameSpan.style.fontWeight = '500';
      }
      
      studentDiv.appendChild(avatar);
      studentDiv.appendChild(nameSpan);
      studentCell.appendChild(studentDiv);
      
      // Balance column
      const balanceCell = document.createElement('td');
      balanceCell.textContent = leader.balance;
      
      // Add cells to row
      row.appendChild(rankCell);
      row.appendChild(studentCell);
      row.appendChild(balanceCell);
      
      // Add row to table
      leaderboardBody.appendChild(row);
    });
  });