// app/components/netflix-tracker/NetflixRenewalTracker.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Edit2, 
  RotateCw, 
  Search,
  SortAsc,
  Info,
  Loader2
} from 'lucide-react';
import {
  fetchAccounts,
  addNewAccount,
  updateAccount,
  deleteAccount,
  renewAccount
} from './accountOperations';
import {
  getFilteredAndSortedAccounts,
  calculateStats,
  getDaysDifference
} from './utils';

const NetflixRenewalTracker = () => {
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDays, setFilterDays] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showStats, setShowStats] = useState(false);
  const [newAccount, setNewAccount] = useState({
    email: '',
    renewalDate: '',
    price: '',
    notes: ''
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchAccounts();
        setAccounts(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError('Failed to load accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const filteredAndSortedAccounts = useMemo(() => 
    getFilteredAndSortedAccounts(accounts, searchTerm, filterDays, sortOrder),
    [accounts, searchTerm, filterDays, sortOrder]
  );

  const statsData = useMemo(() => 
    calculateStats(accounts),
    [accounts]
  );

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (newAccount.email && newAccount.renewalDate) {
      try {
        setLoading(true);
        const addedAccount = await addNewAccount(newAccount);
        setAccounts([...accounts, addedAccount]);
        setNewAccount({
          email: '',
          renewalDate: '',
          price: '',
          notes: ''
        });
        setError(null);
      } catch (error) {
        console.error('Error adding account:', error);
        setError('Failed to add account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartEditing = (account) => {
    setEditingId(account.id);
    setNewAccount({
      email: account.email,
      renewalDate: account.renewalDate,
      price: account.price,
      notes: account.notes
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const updatedAccount = await updateAccount(id, newAccount);
      setAccounts(accounts.map(account => 
        account.id === id ? updatedAccount : account
      ));
      setEditingId(null);
      setNewAccount({
        email: '',
        renewalDate: '',
        price: '',
        notes: ''
      });
      setError(null);
    } catch (error) {
      console.error('Error updating account:', error);
      setError('Failed to update account. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewAccount({
      email: '',
      renewalDate: '',
      price: '',
      notes: ''
    });
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await deleteAccount(id);
      setAccounts(accounts.filter(account => account.id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
    }
  };

  const handleRenewAccount = async (id) => {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    try {
      const updatedAccount = await renewAccount(account);
      setAccounts(accounts.map(acc => 
        acc.id === id ? updatedAccount : acc
      ));
      setError(null);
    } catch (error) {
      console.error('Error renewing account:', error);
      setError('Failed to renew account. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-lg text-gray-600">Loading accounts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Bell className="w-7 h-7" />
            Netflix Account Renewal Tracker
          </CardTitle>
          <Button
            variant="ghost"
            className="text-white hover:text-blue-200"
            onClick={() => setShowStats(!showStats)}
          >
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {showStats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-lg border shadow-sm">
              <p className="text-sm text-gray-500">Total Accounts</p>
              <p className="text-2xl font-semibold">{statsData.total}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
              <p className="text-sm text-red-600">Overdue</p>
              <p className="text-2xl font-semibold text-red-700">{statsData.overdue}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
              <p className="text-sm text-yellow-600">Due Today</p>
              <p className="text-2xl font-semibold text-yellow-700">{statsData.dueToday}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
              <p className="text-sm text-blue-600">Due This Week</p>
              <p className="text-2xl font-semibold text-blue-700">{statsData.dueThisWeek}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
              <p className="text-sm text-green-600">Monthly Total</p>
              <p className="text-2xl font-semibold text-green-700">PKR {statsData.totalPrice}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}
        
        {/* Add Account Form */}
        <form onSubmit={handleAddAccount} className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Add New Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="email"
              value={newAccount.email}
              onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
              placeholder="Netflix Account Email"
              className="w-full"
              required
            />
            <Input
              type="date"
              value={newAccount.renewalDate}
              onChange={(e) => setNewAccount({...newAccount, renewalDate: e.target.value})}
              className="w-full"
              required
            />
            <Input
              type="number"
              value={newAccount.price}
              onChange={(e) => setNewAccount({...newAccount, price: e.target.value})}
              placeholder="Monthly Price"
              className="w-full"
              step="0.01"
              min="0"
            />
            <Input
              type="text"
              value={newAccount.notes}
              onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
              placeholder="Notes (optional)"
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Add Account
          </Button>
        </form>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Accounts</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
              <option value="month">Due This Month</option>
              <option value="future">Future</option>
            </select>
            <Button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SortAsc className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
            </Button>
          </div>
        </div>

        {/* Accounts List */}
        <div className="space-y-4">
          {filteredAndSortedAccounts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">No accounts found</p>
              {searchTerm || filterDays !== 'all' ? (
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedAccounts.map((account) => {
                const daysUntilRenewal = getDaysDifference(account.renewalDate);
                const isUrgent = daysUntilRenewal <= 2;
                const isOverdue = daysUntilRenewal < 0;
                const isEditing = editingId === account.id;

                return (
                  <div
                    key={account.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border transition-all ${
                      isOverdue ? 'bg-red-50 border-red-200' :
                      isUrgent ? 'bg-yellow-50 border-yellow-200' :
                      'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="email"
                          value={newAccount.email}
                          onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                          placeholder="Netflix Account Email"
                        />
                        <Input
                          type="date"
                          value={newAccount.renewalDate}
                          onChange={(e) => setNewAccount({...newAccount, renewalDate: e.target.value})}
                        />
                        <Input
                          type="number"
                          value={newAccount.price}
                          onChange={(e) => setNewAccount({...newAccount, price: e.target.value})}
                          placeholder="Monthly Price"
                          step="0.01"
                          min="0"
                        />
                        <Input
                          type="text"
                          value={newAccount.notes}
                          onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
                          placeholder="Notes (optional)"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {(isUrgent || isOverdue) && 
                            <AlertTriangle className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-yellow-500'}`} />
                          }
                          <p className="font-medium">{account.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                          <span>
                            Renewal: {new Date(account.renewalDate).toLocaleDateString()}
                          </span>
                          {account.price && <span>PKR {account.price}/month</span>}
                          {account.lastRenewalDate && (
                            <span>
                              Last renewed: {new Date(account.lastRenewalDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {account.notes && (
                          <p className="text-sm text-gray-600">{account.notes}</p>
                        )}
                        <p className={`text-sm font-medium ${
                          isOverdue ? 'text-red-600' :
                          isUrgent ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {daysUntilRenewal === 0 ? 'Renews today!' :
                           daysUntilRenewal === 1 ? 'Renews tomorrow!' :
                           daysUntilRenewal === 2 ? 'Renews in 2 days!' :
                           daysUntilRenewal < 0 ? `Renewal overdue by ${Math.abs(daysUntilRenewal)} days` :
                           `${daysUntilRenewal} days until renewal`}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4 md:mt-0">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => handleSaveEdit(account.id)}
                            className="bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleRenewAccount(account.id)}
                            className="bg-green-500 hover:bg-green-600"
                            size="sm"
                            title="Renew Account"
                          >
                            <RotateCw className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleStartEditing(account)}
                            className="bg-blue-500 hover:bg-blue-600"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="bg-red-500 hover:bg-red-600"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetflixRenewalTracker;