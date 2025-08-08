const fs = require('fs');
const path = require('path');

// 文件路径
const joinedCardsPath = path.join(__dirname, 'joined_cards_fields_format.json');
const fasttplistNewPath = path.join(__dirname, 'fasttplist_new.json');

// 读取JSON文件
function readJSONFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } else {
            console.log(`❌ 文件不存在: ${filePath}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ 读取文件时出错: ${filePath}`, error.message);
        return null;
    }
}

// 标准化数组和字符串格式
function normalizeValue(value) {
    if (Array.isArray(value)) {
        return value.join(',');
    }
    return value || '';
}

// 比较两个字段值
function compareFieldValues(oldValue, newValue, fieldName) {
    const normalizedOld = normalizeValue(oldValue);
    const normalizedNew = normalizeValue(newValue);
    
    if (normalizedOld !== normalizedNew) {
        return {
            field: fieldName,
            oldValue: normalizedOld,
            newValue: normalizedNew,
            type: 'changed'
        };
    }
    return null;
}

// 比较两个卡片的字段
function compareCardFields(oldCard, newCard) {
    const changes = [];
    const oldFields = oldCard.fields || {};
    const newFields = newCard.fields || {};
    
    // 获取所有字段名
    const allFields = new Set([
        ...Object.keys(oldFields),
        ...Object.keys(newFields)
    ]);
    
    allFields.forEach(fieldName => {
        const oldValue = oldFields[fieldName];
        const newValue = newFields[fieldName];
        
        if (oldValue === undefined && newValue !== undefined) {
            // 新增字段
            changes.push({
                field: fieldName,
                oldValue: '',
                newValue: normalizeValue(newValue),
                type: 'added'
            });
        } else if (oldValue !== undefined && newValue === undefined) {
            // 删除字段
            changes.push({
                field: fieldName,
                oldValue: normalizeValue(oldValue),
                newValue: '',
                type: 'removed'
            });
        } else if (oldValue !== undefined && newValue !== undefined) {
            // 比较字段值
            const change = compareFieldValues(oldValue, newValue, fieldName);
            if (change) {
                changes.push(change);
            }
        }
    });
    
    return changes;
}

// 通过卡片ID查找卡片
function findCardById(cards, cardId) {
    return cards.find(card => {
        const fields = card.fields || {};
        return fields['卡片ID'] === cardId;
    });
}

// 通过卡片名称查找卡片
function findCardByName(cards, cardName) {
    return cards.find(card => {
        const fields = card.fields || {};
        return fields['名称(必填)'] === cardName;
    });
}

// 生成对比报告
function generateComparisonReport(joinedCards, newCards) {
    console.log('='.repeat(80));
    console.log('📊 卡片对比报告');
    console.log('='.repeat(80));
    
    const joinedRecords = joinedCards.data?.records || [];
    const newRecords = newCards.data?.records || [];
    
    console.log(`📋 数据概览:`);
    console.log(`  joined_cards_fields_format.json: ${joinedRecords.length} 个卡片`);
    console.log(`  fasttplist_new.json: ${newRecords.length} 个卡片`);
    
    const allChanges = [];
    const matchedCards = [];
    const onlyInJoined = [];
    const onlyInNew = [];
    
    // 通过卡片ID进行匹配
    joinedRecords.forEach(joinedCard => {
        const joinedCardId = joinedCard.fields?.['卡片ID'];
        const newCard = findCardById(newRecords, joinedCardId);
        
        if (newCard) {
            matchedCards.push({ joinedCard, newCard });
            const changes = compareCardFields(joinedCard, newCard);
            if (changes.length > 0) {
                allChanges.push({
                    cardId: joinedCardId,
                    cardName: joinedCard.fields?.['名称(必填)'],
                    changes: changes
                });
            }
        } else {
            onlyInJoined.push(joinedCard);
        }
    });
    
    // 查找只在new中存在的卡片
    newRecords.forEach(newCard => {
        const newCardId = newCard.fields?.['卡片ID'];
        const joinedCard = findCardById(joinedRecords, newCardId);
        
        if (!joinedCard) {
            onlyInNew.push(newCard);
        }
    });
    
    // 打印报告
    console.log(`\n🔍 匹配结果:`);
    console.log(`  匹配的卡片: ${matchedCards.length} 个`);
    console.log(`  有变更的卡片: ${allChanges.length} 个`);
    console.log(`  只在joined中: ${onlyInJoined.length} 个`);
    console.log(`  只在new中: ${onlyInNew.length} 个`);
    
    // 详细变更报告
    if (allChanges.length > 0) {
        console.log(`\n📝 详细变更报告:`);
        console.log('-'.repeat(80));
        
        allChanges.forEach((cardChange, index) => {
            console.log(`\n${index + 1}. 卡片: ${cardChange.cardName} (ID: ${cardChange.cardId})`);
            console.log(`   变更字段数: ${cardChange.changes.length}`);
            
            cardChange.changes.forEach(change => {
                const changeIcon = {
                    'added': '➕',
                    'removed': '➖',
                    'changed': '🔄'
                }[change.type] || '❓';
                
                console.log(`   ${changeIcon} ${change.field}:`);
                if (change.type === 'added') {
                    console.log(`      新增: "${change.newValue}"`);
                } else if (change.type === 'removed') {
                    console.log(`      删除: "${change.oldValue}"`);
                } else {
                    console.log(`      原值: "${change.oldValue}"`);
                    console.log(`      新值: "${change.newValue}"`);
                }
            });
        });
    }
    
    // 只在joined中存在的卡片
    if (onlyInJoined.length > 0) {
        console.log(`\n📋 只在joined_cards_fields_format.json中存在的卡片:`);
        console.log('-'.repeat(80));
        onlyInJoined.forEach((card, index) => {
            const cardName = card.fields?.['名称(必填)'];
            const cardId = card.fields?.['卡片ID'];
            console.log(`${index + 1}. ${cardName} (ID: ${cardId})`);
        });
    }
    
    // 只在new中存在的卡片
    if (onlyInNew.length > 0) {
        console.log(`\n📋 只在fasttplist_new.json中存在的卡片:`);
        console.log('-'.repeat(80));
        onlyInNew.forEach((card, index) => {
            const cardName = card.fields?.['名称(必填)'];
            const cardId = card.fields?.['卡片ID'];
            console.log(`${index + 1}. ${cardName} (ID: ${cardId})`);
        });
    }
    
    // 统计变更类型
    const changeStats = {
        added: 0,
        removed: 0,
        changed: 0
    };
    
    allChanges.forEach(cardChange => {
        cardChange.changes.forEach(change => {
            changeStats[change.type]++;
        });
    });
    
    console.log(`\n📊 变更统计:`);
    console.log(`  新增字段: ${changeStats.added} 个`);
    console.log(`  删除字段: ${changeStats.removed} 个`);
    console.log(`  修改字段: ${changeStats.changed} 个`);
    console.log(`  总变更: ${changeStats.added + changeStats.removed + changeStats.changed} 个`);
    
    return {
        matchedCards: matchedCards.length,
        changedCards: allChanges.length,
        onlyInJoined: onlyInJoined.length,
        onlyInNew: onlyInNew.length,
        changes: allChanges,
        stats: changeStats
    };
}

// 导出详细报告
function exportDetailedReport(report) {
    const outputPath = path.join(__dirname, 'comparison_report.json');
    try {
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`\n💾 详细报告已导出到: ${outputPath}`);
    } catch (error) {
        console.log('❌ 导出报告时出错:', error.message);
    }
}

// 主函数
function main() {
    console.log('🚀 开始对比分析...\n');
    
    // 读取文件
    const joinedCards = readJSONFile(joinedCardsPath);
    const fasttplistNew = readJSONFile(fasttplistNewPath);
    
    if (!joinedCards || !fasttplistNew) {
        console.log('❌ 无法读取文件，请检查文件是否存在');
        return;
    }
    
    // 生成对比报告
    const report = generateComparisonReport(joinedCards, fasttplistNew);
    
    // 导出详细报告
    exportDetailedReport(report);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ 对比分析完成');
    console.log('='.repeat(80));
}

// 运行脚本
main(); 