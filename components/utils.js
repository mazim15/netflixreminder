// utils.js
export const getDaysDifference = (renewalDate) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  export const getFilteredAndSortedAccounts = (accounts, searchTerm, filterDays, sortOrder) => {
    let filtered = [...accounts];
  
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    // Apply days filter
    if (filterDays !== 'all') {
      filtered = filtered.filter(account => {
        const days = getDaysDifference(account.renewalDate);
        switch (filterDays) {
          case 'overdue': return days < 0;
          case 'today': return days === 0;
          case 'week': return days > 0 && days <= 7;
          case 'month': return days > 7 && days <= 30;
          case 'future': return days > 30;
          default: return true;
        }
      });
    }
  
    // Apply sorting
    return filtered.sort((a, b) => {
      const dateA = new Date(a.renewalDate);
      const dateB = new Date(b.renewalDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };
  
  export const calculateStats = (accounts) => {
    const total = accounts.length;
    const overdue = accounts.filter(a => getDaysDifference(a.renewalDate) < 0).length;
    const dueToday = accounts.filter(a => getDaysDifference(a.renewalDate) === 0).length;
    const dueThisWeek = accounts.filter(a => {
      const days = getDaysDifference(a.renewalDate);
      return days > 0 && days <= 7;
    }).length;
    const totalPrice = accounts.reduce((sum, account) => sum + (Number(account.price) || 0), 0);
  
    return { total, overdue, dueToday, dueThisWeek, totalPrice };
  };
  